
ClientExpress.Route = (function(method, path, action, options) {
  
  var Route = function(method, path, action, options) {
    this.resolved = function() { return true; };
    this.method = method;
    this.path   = path;
    this.action = action;
    this.regexp = normalize(path, this.keys = [], options.sensitive);
  };

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

  Route.prototype.match = function(path){
    return this.regexp.exec(path);
  };
  
  return Route;
  
})();
