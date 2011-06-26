
ClientExpress.Server = (function() {
  var appCounter = 0;
  
  var Server = function() {
    this.version = '@VERSION';
    this.id = [new Date().valueOf(), appCounter++].join("-");
    this.settings = {};
    this.templateEngines = {};
    this.router = new ClientExpress.Router();
    this.eventListener = new ClientExpress.EventListener();
    this.eventBroker = new ClientExpress.EventBroker(this);
    this.session = {};
    this.content_target_element = document.childNodes[1];
    this.setup_functions = [];
    this.log = function() {
      this.eventBroker.fire({
        type: 'Log',
        arguments: ClientExpress.utils.toArray(arguments)
      });
    };
        
    this.eventBroker.addListener('onProcessRequest', processRequestEventHandler);
    this.eventBroker.addListener('onRender', renderEventHandler);
    this.eventBroker.addListener('onSend', sendEventHandler);
    this.eventBroker.addListener('onRedirect', redirectEventHandler); 
  }
  
  Server.prototype.content_target_area = function(id) {
    var server = this;
    return function() {
      var target_element = document.getElementById ? 
        document.getElementById(id) : 
        (document.all ? 
          document.all[id] : 
          (document.layers ? 
            document.layers[id] : 
            null) );

      server.content_target_element = target_element || document.childNodes[1]

      if (server.content_target_element == document.childNodes[1]) {
        this.log('warning', "Element \"", id, "\" could not be located!")
      }
    };
  };
  
  Server.prototype.configure = function(environment, configure_function) {
    if (typeof environment == 'function') {
      this.setup_functions.push(environment);
      return;
    }
    this.setup_functions.push(function() {
      if (server.enabled(environment)) {
        configure_function.call();
      }
    });    
  };
   
  Server.prototype.use = function(path, other_server) {
    if (typeof path == 'function') {
      path.call(this);
      return;
    }
    
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length-1);
    }
    
    var join_routes = function(base_path, route) {
      if (route == '/') {
        return base_path;
      }
      if (route.substr(0, 1) != '/') {
        return base_path + '/' + route;
      }
      return base_path + route;
    };
    
    var server = this;
    var routes = other_server.router.routes;
    ClientExpress.utils.forEach(routes.get, function(other_route) {
      add_route(server, other_route.method, join_routes(path, other_route.path), other_route.action, path);
    });
    ClientExpress.utils.forEach(routes.post, function(other_route) {
      add_route(server, other_route.method, join_routes(path, other_route.path), other_route.action, path);
    });
    ClientExpress.utils.forEach(routes.put, function(other_route) {
      add_route(server, other_route.method, join_routes(path, other_route.path), other_route.action, path);
    });
    ClientExpress.utils.forEach(routes.del, function(other_route) {
      add_route(server, other_route.method, join_routes(path, other_route.path), other_route.action, path);
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
  
  Server.prototype.enable = function(setting) {
    if (this.settings.hasOwnProperty(setting)) {
      this.settings[setting] = true;
    } else {
      this.settings[setting] = true;
    }
  }
  
  Server.prototype.disable = function(setting) {
    if (this.settings.hasOwnProperty(setting)) {
      this.settings[setting] = false;
    } else {
      this.settings[setting] = false;
    }
  }
  
  Server.prototype.enabled = function(setting) {
    return this.settings.hasOwnProperty(setting) && this.settings[setting];
  }
  
  Server.prototype.disabled = function(setting) {
    return this.settings.hasOwnProperty(setting) && !this.settings[setting];
  }
  
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
    server.router.registerRoute(method, path, action, base_path);
    return server;
  };
  
  Server.prototype.listen = function() { 
    if (!ClientExpress.supported()) {
      this.log('information', "Not supported on this browser");
      return;
    }
    
    var server = this;
    ClientExpress.onDomReady(function() {
      ClientExpress.utils.forEach(server.setup_functions, function(setup_function) {
        setup_function.call(server);
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
      replaceState(request);
      
      server.log('information', "Listening");
      var routes = server.router.routes;
      ClientExpress.utils.forEach(routes.get, function(route) {
        server.log('information', 'Route loaded:', route.method.toUpperCase().lpad("    "), route.path);
      });
      ClientExpress.utils.forEach(routes.post, function(route) {
        server.log('information', 'Route loaded:', route.method.toUpperCase().lpad("    "), route.path);
      });
      ClientExpress.utils.forEach(routes.put, function(route) {
        server.log('information', 'Route loaded:', route.method.toUpperCase().lpad("    "), route.path);
      });
      ClientExpress.utils.forEach(routes.del, function(route) {
        server.log('information', 'Route loaded:', route.method.toUpperCase().lpad("    "), route.path);
      });
      
    });
  };
  
  var pushState = function(request) {
    history.pushState(request, request.title, request.location());
  };
  
  var replaceState = function(request) {
    history.replaceState(request, request.title, request.location());
  };
  
  var processRequestEventHandler = function(event) {
    var route = this.router.match(event.request.method, event.request.path);
    
    if (!route.resolved()) {
      this.log('information', 404, event.request.method.toUpperCase().lpad("    "), event.request.path);
      event.request.delegateToServer();
      return;
    }
  
    this.log('information', 200, event.request.method.toUpperCase().lpad("    "), event.request.path);
  
    var server = this;
    event.request.attachRoute(route);
    var response = new ClientExpress.Response(event.request, server);
    if (!event.request.isHistoryRequest && !event.request.isRedirect) {
        pushState(event.request);
    }
    route.action(event.request, response);
  };
  
  var renderEventHandler = function(event) {
    var views = this.settings['views'] || "";
    var ext = this.settings['view engine'] || "";
    
    var template = views + event.template;

    if (template.lastIndexOf(".") != -1 && template.lastIndexOf(".") <= 4) {
      ext = template.substr(template.lastIndexOf(".") - 1, template.length);
      template = template.substr(0, template.lastIndexOf(".") - 1);
    }
    var ext = ext || this.settings['view engine'] || "";
    
    if (ext != "") {
      ext = "." + ext;
      template = template + ext;
    }
    
    var templateEngine = this.templateEngines[ext];
    
    this.eventBroker.fire({
      type: 'Send',
      request: event.request,
      target_element: event.target_element,
      content: templateEngine.compile(template, event.args)
    })
  };
  
  var sendEventHandler = function(event) {
    event.target_element.innerHTML = event.content;
  };
  
  var redirectEventHandler = function(event) {
    this.log('information', 302, 'GET ', event.path);
    var request = new ClientExpress.Request({
      method: 'get',
      fullPath: event.path,
      title: '',
      isRedirect: true,
      session: this.session,
      delegateToServer: function () {
        window.location.pathname = event.path;
      }
    });
    this.eventBroker.fire({
      type: 'ProcessRequest',
      request: request
    });
  };
  
  return Server;
  
})();

