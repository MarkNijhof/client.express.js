
ClientExpress.Server = (function() {
  var appCounter = 0;
  
  var Server = function() {
    this.version = '@VERSION';
    this.id = [new Date().valueOf(), appCounter++].join("-");
    this.settings = {};
    this.templateEngines = {};
    this.router = new ClientExpress.Router();
    this.eventListener = new ClientExpress.EventListener();
    this.log = new ClientExpress.Logger();
    this.session = {};
    this.content_target_element = document.childNodes[1];
    this.setup_functions = [];
  }

  Server.prototype.logger = function() {
    var that = this;
    return function() {
      that.log.enable();
    };
  };
  
  Server.prototype.content_target_area = function(id) {
    var that = this;
    return function() {
      var target_element = document.getElementById ? 
        document.getElementById(id) : 
        (document.all ? 
          document.all[id] : 
          (document.layers ? 
            document.layers[id] : 
            null) );

      that.content_target_element = target_element || document.childNodes[1]

      if (that.content_target_element == document.childNodes[1]) {
        that.log.warning("The element \"", id, "\" could not be located as a content target!")
      }
    };
  };
  
  Server.prototype.configure = function(configure_function) {
    this.setup_functions.push(configure_function);
  }
   
  Server.prototype.use = function(path, other_server) {
    var that = this;
    
    if (typeof path == 'function') {
      this.setup_functions.push(path);
      return;
    }
    
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length-1);
    }
    
    var routes = other_server.router.routes;
    ClientExpress.utils.forEach(routes.get, function(other_route) {
      add_route(that, other_route.method, path + other_route.path, other_route.action, path);
    });
    ClientExpress.utils.forEach(routes.post, function(other_route) {
      add_route(that, other_route.method, path + other_route.path, other_route.action, path);
    });
    ClientExpress.utils.forEach(routes.put, function(other_route) {
      add_route(that, other_route.method, path + other_route.path, other_route.action, path);
    });
    ClientExpress.utils.forEach(routes.del, function(other_route) {
      add_route(that, other_route.method, path + other_route.path, other_route.action, path);
    });
  };
  
  Server.prototype.set = function(setting, val){
    if (val === undefined) {
      if (this.settings.hasOwnProperty(setting)) {
        return this.settings[setting];
      } else if (this.parent) {
        return this.parent.set(setting);
      }
    } else {
      this.settings[setting] = val;
      return this;
    }
  };
  
  Server.prototype.register = function(ext, template_engine){
    if (template_engine === undefined) {
      if (this.templateEngines.hasOwnProperty(ext)) {
        return this.templateEngines[ext];
      } else if (this.parent) {
        return this.parent.set(ext);
      }
    } else {
      this.templateEngines[ext] = template_engine;
      return this;
    }
  };
  
  Server.prototype.get  = function(path, action) { return add_route(this, 'get',  path, action, ''); };
  Server.prototype.post = function(path, action) { return add_route(this, 'post', path, action, ''); };
  Server.prototype.put  = function(path, action) { return add_route(this, 'put',  path, action, ''); };
  Server.prototype.del  = function(path, action) { return add_route(this, 'del',  path, action, ''); };

  var add_route = function(server, method, path, action, base_path) {
    server.log.information(" + ", method.toUpperCase().lpad("    "), path);
    server.router.registerRoute(method, path, action, base_path);
    return server;
  };
  
  Server.prototype.processRequest = function(request) {
    var route = this.router.match(request.method, request.path);
    
    if (!route.resolved()) {
      this.log.information(404, request.method.toUpperCase().lpad("    "), request.path);
      request.delegateToServer();
      return;
    }

    this.log.information(200, request.method.toUpperCase().lpad("    "), request.path);

    var server = this;
    request.attachRoute(route);
    var response = new ClientExpress.Response(request, server);
    if (!request.isHistoryRequest) {
      server.pushState(request);
    }
    route.action(request, response);
    response.process();
  };
  
  Server.prototype.pushState = function(request) {
    history.pushState(request, request.title, request.location());
  };
  
  Server.prototype.replaceState = function(request) {
    history.replaceState(request, request.title, request.location());
  };

  Server.prototype.listen = function() { 
    if (!ClientExpress.supported()) {
      server.log.information("Not supported on this browser");
      return;
    }
    
    var server = this;
    ClientExpress.onDomReady(function() {
      ClientExpress.utils.forEach(server.setup_functions, function(setup_function) {
        setup_function.call();
      });
      server.eventListener.registerEventHandlers(server); 
      
      var request = new ClientExpress.Request({
        method: 'get',
        fullPath: window.location.pathname,
        title: document.title,
        session: server.session,
        delegateToServer: function () {
          window.location.pathname = window.location.pathname;
        }
      });
      server.replaceState(request);
      
      server.log.information("Listening");
    });
  };  
  
  return Server;
  
})();

