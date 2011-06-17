
ClientExpress.Server = (function() {
  var appCounter = 0;
  
  var Server = function() {
    this.version = '@VERSION';
    this.id = [new Date().valueOf(), appCounter++].join("-");
    this.router = new ClientExpress.Router();
    this.eventListener = new ClientExpress.EventListener();
    this.log = new ClientExpress.Logger();
    this.session = {};
  }

  Server.prototype.logger = function() {
    this.log.enable();
  };
   
  Server.prototype.use = function(path, other_server) {
    var that = this;
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length-1);
    }
    
    var routes = other_server.router.routes;
    ClientExpress.utils.forEach(routes.get, function(other_route) {
      add_route(that, other_route.method, path + other_route.path, other_route.action);
    });
  };

  Server.prototype.get = function(path, action) { return add_route(this, 'get', path, action); };
  Server.prototype.post = function(path, action) { return add_route(this, 'post', path, action); };
  Server.prototype.put = function(path, action) { return add_route(this, 'put', path, action); };
  Server.prototype.del = function(path, action) { return add_route(this, 'del', path, action); };

  var add_route = function(server, method, path, action) {
    server.log.information(" + ", method.toUpperCase().lpad("    "), path)
    server.router.registerRoute(method, path, action);
    return server;
  };

  Server.prototype.listen = function() { 
    var server = this;
    this.eventListener.registerEventHandlers(server); 
    this.log.information("Listening");
  };
  
  Server.prototype.processRequest = function(request) {
    var route = this.router.match(request.method, request.path);
    
    if (!route.resolved()) {
      this.log.warning(404, request.method.toUpperCase().lpad("    "), request.path)
      request.delegateToServer();
      return;
    }

    var response = new ClientExpress.Response(request, this.log);
    route.action(request, response);
    processResponse(response, this.log);
  };
  
  var processResponse = function(response, log) {
    log.information(200, response.request.method.toUpperCase().lpad("    "), response.request.path);
  }
  
  return Server;
  
})();
