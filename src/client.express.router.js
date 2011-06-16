
ClientExpress.Router = (function() {
  
  var Router = function() {
    this.routes = {
      get: [],
      post: [],
      put: [],
      del: []
    };
  };
  
  Router.prototype.match = function(method, path){
    var route_count = this.routes[method].length;
        
    for (var i = 0; i < route_count; ++i) {
      var route = this.routes[method][i];
      if (route.match(path)) {
        return route;
      }
    }
    
    return { resolved: function() { return false; } };
  };
    
  Router.prototype.registerRoute = function(method, path, action) {
    this.routes[method].push(new ClientExpress.Route(method, path, action, { sensitive: false }));
  };
  
  return Router;

})();
