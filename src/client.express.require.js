
// CommonJS require()

function require_override(p){
  var path = require.resolve(p)
    , mod = require.modules[path];
  if (!mod) {
    var exports;
    $.ajax({ 
      type: "GET",
      url: path + '.js',   
      async: false,
      success : function(text) {
        exports = {};
        eval(text);
        require.modules[path + '.js'] = { exports: exports };
      }
    });
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

});

