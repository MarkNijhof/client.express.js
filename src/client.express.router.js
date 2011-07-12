
ClientExpress.Router = (function() {
  
  var Router = function() {
    this.routes = {
      get: [],
      post: [],
      put: [],
      del: [],
      before: [],
      after: []
    };
  };
  
  Router.prototype.match = function(method, path){
    var route_count = this.routes[method].length;
        
    for (var i = 0; i < route_count; ++i) {
      var route = this.routes[method][i];
      if (captures = route.match(path)) {

        keys = route.keys;
        route.params = [];

        // params from capture groups
        for (var j = 1, jlen = captures.length; j < jlen; ++j) {
          var key = keys[j-1]
            , val = 'string' == typeof captures[j]
              ? decodeURIComponent(captures[j])
              : captures[j];
          if (key) {
            route.params[key.name] = val;
          } else {
            route.params.push(val);
          }
        }

        return route;
      }
    }
    
    return { resolved: function() { return false; } };
  };
    
  Router.prototype.registerRoute = function(method, path, action, base_path) {
    this.routes[method].push(new ClientExpress.Route(method, path, action, base_path, { sensitive: false }));
  };
  
  return Router;

})();
