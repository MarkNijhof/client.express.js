
ClientExpress.Server = (function() {
  var _version = '@VERSION';
  var _router;
  var _eventListener;
  
  var Server = function() {
      _router = new ClientExpress.Router();
      _eventListener = new ClientExpress.EventListener();
  };
  
  var server = Server.prototype;
  
  server.version = function() { return _version; }

  server.router = function() { return _router; };

  server.get = function(path, action) { return route(this, 'get', path, action); };
  server.post = function(path, action) { return route(this, 'post', path, action); };
  server.put = function(path, action) { return route(this, 'put', path, action); };
  server.del = function(path, action) { return route(this, 'del', path, action); };

  server.listen = function() { _eventListener.registerEventHandlers(); };
  
  server.processRequest = function(request) {
    var route = _router.match(request.path);
    
    if (!route.resolved()) {
      return false;
    }
    var response = new ClientExpress.Response(request);
    route.action(request, response);
    return processResponse(response);
  };
  
  server.processResponse = function(response) {
    console.log("processing: " + response)
  }
  
  return Server;

  function route(server, method, path, action) {
    _router.registerRoute(method, path, action);
    return server;
  };
  
})();

// server.use = function(path, server) {
//   if (typeof(server) != 'ClientExpress.Server') {
//     return 'not a ClientExpress.Server';
//   }
//   
//   if (path[path.length - 1] === '/') {
//     path = path.substring(0, path.length-1);
//   }
//   
//   for (var i = 0, len = server.routes().length; i < len; ++i) {
//     route = server.routes()[i];
//     this.route(route.method, path + route.path, route.action);
//   }
// };