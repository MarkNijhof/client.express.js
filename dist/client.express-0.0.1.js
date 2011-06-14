// client.express.js JavaScript Routing, version: 0.0.1
// (c) 2011 Mark Nijhof
//
//  Released under MIT license.
//

ClientExpress = {};

ClientExpress.createServer = function() {
  return new ClientExpress.Server();
};

ClientExpress.supported = function () {
  return (typeof window.history.pushState == 'function')
};

ClientExpress.Server = (function() {
  var _version = '0.0.1';
  var _router;
  
  var Server = function() {
      _router = new ClientExpress.Router();    
  };
  
  var server = Server.prototype;
  
  server.version = function() { return _version; }

  server.router = function() { return _router; };

  server.get = function(path, action) { return route(this, 'get', path, action); };
  server.post = function(path, action) { return route(this, 'post', path, action); };
  server.put = function(path, action) { return route(this, 'put', path, action); };
  server.del = function(path, action) { return route(this, 'del', path, action); };
  
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

ClientExpress.Route = function(method, path, action, options) {
  this.resolved = function() { return true; };
  this.method = method;
  this.path   = path;
  this.action = action;
  this.regexp = normalize(path, this.keys = [], options.sensitive);


  /**
   * Normalize the given path string,
   * returning a regular expression.
   *
   * An empty array should be passed,
   * which will contain the placeholder
   * key names. For example "/user/:id" will
   * then contain ["id"].
   *
   * @param  {String|RegExp} path
   * @param  {Array} keys
   * @param  {Boolean} sensitive
   * @return {RegExp}
   * @api private
   */
  function normalize(path, keys, sensitive) {
    if (path instanceof RegExp) return path; 
    path = path
      .concat('/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (format || '') + (capture || '([^/]+?)') + ')'
          + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/\*/g, '(.+)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  }
};

ClientExpress.Route.prototype.match = function(path){
  return this.regexp.exec(path);
};


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
