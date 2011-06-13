// client.express.js JavaScript Routing, version: 0.0.1
// (c) 2011 Mark Nijhof
//
//  Released under MIT license.
//

(function(global) {
  var clientExpress = {
    VERSION: '0.0.1'
  };
  
  if (global.ClientExpress) {
    throw new Error('clientExpress is already defined');
  }
  
  global.ClientExpress = clientExpress;
})(typeof window === 'undefined' ? this : window);


ClientExpress.prototype.createServer = function() {
  return new ClientExpress.Server();
};

ClientExpress.prototype.supported = function () {
  return (typeof window.history.pushState == 'function')
};

var server = ClientExpress.Server.prototype;

ClientExpress.Server = (function() {
  
  var Server = function(){
    this.init();
  }

});

server.init = function() {
  this._router = new ClientExpress.Routes();
};

server.routes = function() {
  return this._router;
};

server.route = function(method, path, action) {
  this._router.registerRoute(method, path, action);
  return server;  
};

server.get = function(path, action) {
  return this.route('get', path, action);
};

server.post = function(path, action) {
  return this.route('post', path, action);
};

server.put = function(path, action) {
  return this.route('put', path, action);
};

server.del = function(path, action) {
  return this.route('del', path, action);
};

server.use = function(path, server) {
  if (typeof(server) != 'ClientExpress.Server') {
    return 'not a ClientExpress.Server';
  }
  
  if (path[path.length - 1] === '/') {
    path = path.substring(0, path.length-1);
  }
  
  for (var i = 0, len = server.routes().length; i < len; ++i) {
    route = server.routes()[i];
    this.route(route.method, path + route.path, route.action);
  }
};

ClientExpress.Route = function(method, path, action) {
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


ClientExpress.Router = function() {
  this._routes = {
    get: {},
    post: {},
    put: {},
    del: {}
  };
};

ClientExpress.Router.prototype.registerRoute = function(method, path, action) {
  this._routes[method].push(new ClientExpress.Route(method, path, action));
};