
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
    this.content_element = document.childNodes[1];
    this.setup_functions = [];
        
    this.eventBroker.addListener('onProcessRequest', processRequestEventHandler);
    this.eventBroker.addListener('onRequestProcessed', requestProcessedEventHandler);
    this.eventBroker.addListener('onBeforeRender', beforeRenderEventHandler);
    this.eventBroker.addListener('onAfterRender', afterRenderEventHandler);
    this.eventBroker.addListener('onRender', renderEventHandler);
    this.eventBroker.addListener('onSend', sendEventHandler);
    this.eventBroker.addListener('onRedirect', redirectEventHandler); 
  }

  Server.prototype.log = function() {
    this.eventBroker.fire({
      type: 'Log',
      arguments: ClientExpress.utils.toArray(arguments)
    });
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
    
    var server = this;
    if (typeof path == 'function') {
      path.call(this);
      return;
    }
  
    if (typeof path == 'string') {
      if (path[path.length - 1] === '/') {
        path = path.substring(0, path.length-1);
      }
  
      var join_routes = function(base_path, route) {
        if (route instanceof RegExp) {
          var source = route.source
          if (source.substr(0, 1) == '^') {
            return new RegExp('^' + base_path + source.substr(1, source.length));
          }
          if (source.substr(0, 2) == '\\/') {
            return new RegExp(base_path + source);
          }
          return new RegExp(base_path + '/' + source);
        }
    
        if (route == '/') {
          return base_path;
        }      
        if (route.substr(0, 1) != '/') {
          return base_path + '/' + route;
        }
        return base_path + route;
      };
  
      var routes = other_server.router.routes;
  
      var routes = routes.get.concat(
                     routes.post.concat(
                       routes.put.concat(
                         routes.del.concat(
                           routes.before.concat(
                             routes.after
                           )
                         )
                       )
                     )
                   );
               
      ClientExpress.utils.forEach(routes, function(other_route) {
        add_route(server, other_route.method, join_routes(path, other_route.path), other_route.action, path);
      });
    }
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
  
  Server.prototype.get    = function(path, action) { return add_route(this, 'get',    path, action, ''); };
  Server.prototype.post   = function(path, action) { return add_route(this, 'post',   path, action, ''); };
  Server.prototype.put    = function(path, action) { return add_route(this, 'put',    path, action, ''); };
  Server.prototype.del    = function(path, action) { return add_route(this, 'del',    path, action, ''); };
  Server.prototype.before = function(path, action) { return add_route(this, 'before', path, action, ''); };
  Server.prototype.after  = function(path, action) { return add_route(this, 'after',  path, action, ''); };

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
      server.eventBroker.fire({
        type: 'BeforeApplyingConfiguration',
        server: server
      });
      ClientExpress.utils.forEach(server.setup_functions, function(setup_function) {
        setup_function.call(server);
      });
      server.eventListener.registerEventHandlers(server); 
      
      replaceState(new ClientExpress.Request({
        method: 'get',
        originalUrl: window.location.href,
        title: document.title,
        session: server.session,
        delegateToServer: function () {
          window.location = window.location.href;
        }
      }));
      
      server.log('information', "Listening");
      var routes = server.router.routes.get.concat(
                     server.router.routes.post.concat(
                       server.router.routes.put.concat(
                         server.router.routes.del
                       )
                     )
                   ).sortByName('path');
                   
      ClientExpress.utils.forEach(routes, function(route) {
        server.log('information', 'Route registered:', route.method.toUpperCase().lpad("    "), route.path);
      });
    });
  };
  
  var pushState = function(request) {
    window.history.pushState(JSON.stringify(request), request.title, request.location());
  };
  
  var replaceState = function(request) {
    window.history.replaceState(JSON.stringify(request), request.title, request.location());
  };
  
  var processRequestEventHandler = function(event) {
    var server = this;
    var request = event.request;
    var route = this.router.match(request.method, request.originalUrl);
    
    if (!route.resolved()) {
      this.log('information', 404, request.method.toUpperCase().lpad("    "), request.originalUrl);
      event.request.delegateToServer();
      return;
    }

    if (!event.request.isHistoryRequest && !event.request.isRedirect) {
      pushState(event.request);
    }    
  
    this.log('information', 200, request.method.toUpperCase().lpad("    "), request.originalUrl);
  
    request.attachRoute(route);
    var response = new ClientExpress.Response(request, server);

    route.action(request, response);
  };
  
  var requestProcessedEventHandler = function(event) {
    // if (!event.request.isHistoryRequest && !event.request.isRedirect) {
    //   pushState(event.request);
    // }    
  }
  
  var beforeRenderEventHandler = function(event) {
    var server = this;
    var request = event.request;
    var response = event.response;
    var route = this.router.match('before', request.originalUrl);
    
    var next = function() {
      server.eventBroker.fire({
        type: 'Render',
        request: request,
        response: response,
        content_element: event.content_element,
        template: event.template,
        args: event.args
      });
    };
    
    if (!route.resolved()) {
      next();
      return;
    }
  
    route.action(request, response, event.args, event.content_element, next);
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

    event.content_element.innerHTML = templateEngine.compile(template, event.args);
    
    this.eventBroker.fire({
      type: 'AfterRender',
      request: event.request,
      response: event.response,
      content_element: event.content_element,
      template: event.template,
      args: event.args
    });
  };

  var afterRenderEventHandler = function(event) {
    var server = this;
    var request = event.request;
    var response = event.response;
    var route = this.router.match('after', request.originalUrl);
    
    var next = function() {
      server.eventBroker.fire({
        type: 'RequestProcessed',
        request: request,
        response: response,
        content_element: event.content_element,
        template: event.template,
        args: event.args
      });
    };
    
    if (!route.resolved()) {
      next();
      return;
    }
  
    route.action(request, response, event.args, event.content_element, next);
  };
  
  var sendEventHandler = function(event) {
    event.content_element.innerHTML = event.content;
    
    this.eventBroker.fire({
      type: 'RequestProcessed',
      request: event.request,
      response: event.response, 
      content_element: event.content_element,
      args: {}
    });    
  };
  
  var redirectEventHandler = function(event) {
    this.log('information', 302, 'GET ', event.originalUrl);
    
    var request = new ClientExpress.Request({
      method: 'get',
      originalUrl: event.originalUrl,
      title: '',
      isRedirect: true,
      session: event.request.session,
      delegateToServer: function () {
        window.location.originalUrlname = event.originalUrl;
      }
    });

    this.eventBroker.fire({
      type: 'ProcessRequest',
      request: request
    });
    
    this.eventBroker.fire({
      type: 'RequestProcessed',
      request: event.request,
      response: event.response, 
      content_element: event.content_element,
      args: {}
    });    
  };
  
  return Server;
  
})();

