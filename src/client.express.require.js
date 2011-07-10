
// CommonJS require()

function require_override(p){
  
  function createXMLHttp() {
    if (typeof XMLHttpRequest != 'undefined') {
      return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      var avers = ["Microsoft.XmlHttp", "MSXML2.XmlHttp", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.5.0"];
      for (var i = avers.length -1; i >= 0; i--) {
        try {
          httpObj = new ActiveXObject(avers[i]);
          return httpObj;
        } catch(e) {}
      }
    }
    throw new Error('XMLHttp (AJAX) not supported');
  }

  var ajaxObj = createXMLHttp();
  
  var path = require.resolve(p)
    , mod = require.modules[path];
  if (!mod) {
    var exports;
    
    var ajaxObj = createXMLHttp();
    ajaxObj.open('GET', path + '.js', false);
    ajaxObj.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        exports = {};
        eval(this.responseText);
        require.modules[path + '.js'] = { exports: exports };
      }
    };
    ajaxObj.send();

    if (exports != null) {
      return exports;
    }
    throw new Error('failed to require "' + p + '"');
  }
  if (!mod.exports) {
    mod.exports = {};
    mod.call(mod.exports, mod, mod.exports, require.relative(path));
  }
  return mod.exports;
};

require_override.modules = {};

require_override.resolve = function (path){
  var orig = path
    , reg = path + '.js'
    , index = path + '/index.js';
  return require.modules[reg] && reg
    || require.modules[index] && index
    || orig;
};

require_override.register = function (path, fn){
  require.modules[path] = fn;
};

require_override.relative = function (parent) {
  return function(p){
    if ('.' != p[0]) return require(p);
  
    var path = parent.split('/')
      , segs = p.split('/');
    path.pop();
  
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i];
      if ('..' == seg) path.pop();
      else if ('.' != seg) path.push(seg);
    }

    return require(path.join('/'));
  };
};

if (typeof require != 'undefined') {
  var modules = require.modules;
  require = require_override;
  require.modules = modules;
} else {
  require = require_override;
}

require.register("express.js", function(module, exports, require){

  exports.version = '@VERSION';
  
  exports.createServer = function() {
    return ClientExpress.createServer();
  };

  exports.logger = function() {
    return ClientExpress.logger();
  };
  
  exports.setTitle = function(options) {
    return ClientExpress.setTitle(options);
  };
  
  exports.googleAnalytics = function() {
    return ClientExpress.googleAnalytics();
  };
  
  // Dummies
  exports.methodOverride  = function() { return function() {}; };
  exports.bodyParser      = function() { return function() {}; };
  exports.cookieParser    = function() { return function() {}; };
  exports.session         = function() { return function() {}; };
  exports['static']       = function() { return function() {}; };
  exports.errorHandler    = function() { return function() {}; };

});

