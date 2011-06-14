
ClientExpress.Router = (function() {
  var _routes;
  
  var Router = function() {
    _routes = {
      get: [],
      post: [],
      put: [],
      del: []
    };
  };
  
  var router = Router.prototype;
  
  router.match = function(method, path){
    var route_count = _routes[method].length
    
    for (var i = 0; i < route_count; ++i) {
      var route = _routes[method][i];
      if (route.match(path)) {
        return route;
      }
    }
    
    return { resolved: function() { return false; } };
  };
    
  router.registerRoute = function(method, path, action) {
    _routes[method].push(new ClientExpress.Route(method, path, action, { sensitive: false }));
  };
  
  return Router;

})();
