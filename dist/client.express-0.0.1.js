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
  var _eventListener;
  var _session;
  
  var Server = function() {
      _router = new ClientExpress.Router();
      _eventListener = new ClientExpress.EventListener(this);
      _session = {};
  };
  
  var server = Server.prototype;
  
  server.version = function() { return _version; }

  server.router = function() { return _router; };
  
  server.session = function() { return _session };

  server.get = function(path, action) { return route(this, 'get', path, action); };
  server.post = function(path, action) { return route(this, 'post', path, action); };
  server.put = function(path, action) { return route(this, 'put', path, action); };
  server.del = function(path, action) { return route(this, 'del', path, action); };

  server.listen = function() { _eventListener.registerEventHandlers(); };
  
  server.processRequest = function(request) {
    var route = _router.match(request.method, request.path);
    
    if (!route.resolved()) {
      console.log("Delegating to the server!")
      request.delegateToServer();
      return;
    }
    
    var response = new ClientExpress.Response(request);
    route.action(request, response);
    this.processResponse(response);
  };
  
  server.processResponse = function(response) {
    console.log("processing: " + response.request().path);
  }
  
  return Server;

  function route(server, method, path, action) {
    console.log("Register route for: " + path);
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
    var route_count = _routes[method].length;
        
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


ClientExpress.EventListener = (function(server) {
  var _server;
  
  var EventListener = function(server) {
    _server = server;
  };
  
  var eventListener = EventListener.prototype;
  
  eventListener.registerEventHandlers = function() {
    console.log("Register Event Handlers");

    document.onclick = function() {
      var ev = arguments[0] || window.event;
      var element = ev.target || ev.srcElement;
      
      if (element.tagName.toLowerCase() == 'a') {
        var request = new ClientExpress.Request({
          method: 'get',
          fullPath: element.href,
          title: element.title,
          session: _server.session(),
          delegateToServer: function () {
            window.location.pathname = element.href;
          }
        });
        // Davis.history.pushState(request);
        _server.processRequest(request);
        return false;
      }
    };

    document.onsubmit = function() {
      var ev = arguments[0] || window.event;
      var element = ev.target || ev.srcElement;
      
      if (element.tagName.toLowerCase() == 'form') {
        var self = this
      
        var request = new ClientExpress.Request({
          method: element.method,
          fullPath: [element.action, ClientExpress.utils.serializeArray(element)].join("?"),
          title: element.title,
          session: _server.session(),
          delegateToServer: function () {
            element.submit();
          }
        });

        console.log(request);
        // Davis.history.pushState(request);
        _server.processRequest(request);
        return false;
      }
    };


    // var links = document.getElementsByTagName('a');
    // for (var i = 0, length = links.length, link = links[i]; i < length; i++) {
    //   if (link.addEventListener) {
    //     link.addEventListener('click', clickHandler, false);
    //     console.log("found: " + link.href);
    //   } else if (link.attachEvent) {
    //     link.attachEvent('onclick', clickHandler);
    //     console.log("found: " + link.href);
    //   }
    // }
    // 
    // var forms = document.forms;
    // for (var i = 0, length = forms.length, form = forms[i]; i < length; i++) {
    //   if (form.addEventListener) {
    //     form.addEventListener('sumbit', submitHandler, false);
    //     console.log("found: " + form.action);
    //   } else if (form.attachEvent) {
    //     form.attachEvent('onsubmit', submitHandler);
    //     console.log("found: " + form.action);
    //   }
    // }
    
    // if (window.addEventListener) {
    //   window.addEventListener('popstate', onPopStateHandler, false);
    // } else if (window.attachEvent) {
    //   window.attachEvent('onpopstate', onPopStateHandler);
    // }
    
  };

  // var handler = function(targetExtractor) {
  //   var request = new ClientExpress.Request(targetExtractor.call(this));
  //   // Davis.history.pushState(request);
  //   // return _server.processRequest(request);
  // };
  // 
  // var clickHandler = handler(function () {
  //   var self = this
  // });
  // 
  // var submitHandler = handler(function () {
  //   var extractFormParams = function (form) {
  //     return ClientExpress.utils.map(form.serializeArray(), function (attr) {
  //       return [attr.name, attr.value].join('=')
  //     }).join('&')
  //   }
  // 
  //   var self = this
  // 
  //   return {
  //     method: this.method,
  //     fullPath: [this.action, extractFormParams(this)].join("?"),
  //     title: this.title,
  //     // session: _server.session(),
  //     delegateToServer: function () {
  //       self.submit();
  //     }
  //   };
  // });

  return EventListener;  
})();


ClientExpress.Request = (function(raw_data) {
  
  var Request = function(raw_data) {
    var self = this;
    this.session = raw_data.session;
    this.params = {};
    this.title = raw_data.title;
    this.queryString = raw_data.fullPath.split("?")[1];

    if (this.queryString) {
      ClientExpress.utils.forEach(this.queryString.split("&"), function (keyval) {
        var paramName = keyval.split("=")[0],
            paramValue = keyval.split("=")[1],
            nestedParamRegex = /^(\w+)\[(\w+)\]/,
            nested;

        if (nested = nestedParamRegex.exec(paramName)) {
          var paramParent = nested[1];
          var paramName = nested[2];
          var parentParams = self.params[paramParent] || {};
          parentParams[paramName] = paramValue;
          self.params[paramParent] = parentParams;
        } else {
          self.params[paramName] = paramValue;
        };
      });
    };

    this.method = (this.params._method || raw_data.method).toLowerCase();
    this.path = raw_data.fullPath.replace(/\?.+$/, "").replace(window.location.protocol + '//' + window.location.host, '');
    this.delegateToServer = raw_data.delegateToServer || function() {};
    // this.isForPageLoad = raw_data.forPageLoad || false;

    // if (Davis.Request.prev) Davis.Request.prev.makeStale(this);
    // Davis.Request.prev = this;
  };
  
  var request = Request.prototype;
    
  return Request;

})();


ClientExpress.Response = (function(request) {
  var _request;
  
  var Response = function(request) {
    _request = request;
  };
  
  var response = Response.prototype;
  
  response.request = function() { 
    return _request; 
  };
  
  response.send = function(string) {
    
  };  
  
  response.render = function(template) {
    
  };
  
  response.redirect = function(path) {
    
  };
  
  response.contentType = function(content_type) {
    
  };
  
  return Response;

})();

/*!
 * Davis - utils
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/**
 * A module that provides wrappers around modern JavaScript so that native implementations are used
 * whereever possible and JavaScript implementations are used in those browsers that do not natively
 * support them.
 */
ClientExpress.utils = (function () {

  /**
   * ## Davis.utils.every
   * A wrapper around native Array.prototype.every that falls back to a pure JavaScript implementation
   * in browsers that do not support Array.prototype.every.  For more details see the full docs on MDC
   * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
   *
   * @private
   * @param {array} the array to loop through
   * @param {fn} the function to that performs the every check
   * @param {thisp} an optional param that will be set as fn's this value
   * @returns {Array}
   */
  if (Array.prototype.every) {
    var every = function (array, fn) {
      return array.every(fn, arguments[2])
    }
  } else {
    var every = function (array, fn) {
      if (array === void 0 || array === null) throw new TypeError();
      var t = Object(array);
      var len = t.length >>> 0;
      if (typeof fn !== "function") throw new TypeError();

      var thisp = arguments[2];
      for (var i = 0; i < len; i++) {
        if (i in t && !fn.call(thisp, t[i], i, t)) return false;
      }

      return true;
    }
  };

  /**
   * ## Davis.utils.forEach
   * A wrapper around native Array.prototype.forEach that falls back to a pure JavaScript implementation
   * in browsers that do not support Array.prototype.forEach.  For more details see the full docs on MDC
   * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
   *
   * @private
   * @param {array} the array to loop through
   * @param {fn} the function to apply to every element of the array
   * @param {thisp} an optional param that will be set as fn's this value
   * @returns {Array}
   */
  if (Array.prototype.forEach) {
    var forEach = function (array, fn) {
      return array.forEach(fn, arguments[2])
    }
  } else {
    var forEach = function (array, fn) {
      if (array === void 0 || array === null) throw new TypeError();
      var t = Object(array);
      var len = t.length >>> 0;
      if (typeof fn !== "function") throw new TypeError();
      

      var thisp = arguments[2];
      for (var i = 0; i < len; i++) {
        if (i in t) fn.call(thisp, t[i], i, t);
      }
    };
  };

  /**
   * ## Davis.utils.filter
   * A wrapper around native Array.prototype.filter that falls back to a pure JavaScript implementation
   * in browsers that do not support Array.prototype.filter.  For more details see the full docs on MDC
   * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
   *
   * @private
   * @param {array} the array to filter
   * @param {fn} the function to do the filtering
   * @param {thisp} an optional param that will be set as fn's this value
   * @returns {Array}
   */
  if (Array.prototype.filter) {
    var filter = function (array, fn) {
      return array.filter(fn, arguments[2])
    }
  } else {
    var filter = function(array, fn) {
      if (array === void 0 || array === null) throw new TypeError();
      var t = Object(array);
      var len = t.length >>> 0;
      if (typeof fn !== "function") throw new TypeError();
      

      var res = [];
      var thisp = arguments[2];
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i]; // in case fn mutates this
          if (fn.call(thisp, val, i, t)) res.push(val);
        }
      }

      return res;
    };
  };


  /**
   * ## Davis.utils.map
   * A wrapper around native Array.prototype.map that falls back to a pure JavaScript implementation
   * in browsers that do not support Array.prototype.map.  For more details see the full docs on MDC
   * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
   *
   * @private
   * @param {array} the array to map through
   * @param {fn} the function to do the mapping
   * @param {thisp} an optional param that will be set as fn's this value
   * @returns {Array}
   */
  if (Array.prototype.map) {
    var map = function (array, fn) {
      return array.map(fn, arguments[2])
    }
  } else {
    var map = function(array, fn) {
      if (array === void 0 || array === null) throw new TypeError();
      var t = Object(array);
      var len = t.length >>> 0;
      if (typeof fn !== "function") throw new TypeError();
      

      var res = new Array(len);
      var thisp = arguments[2];
      for (var i = 0; i < len; i++) {
        if (i in t) res[i] = fn.call(thisp, t[i], i, t);
      }

      return res;
    };
  };

  /**
   * ## Davis.utils.toArray
   * A convinience function for converting arguments to a proper array
   *
   * @private
   * @param {args} a functions arguments
   * @param {start} an integer at which to start converting the arguments to an array
   * @returns {Array}
   */
  var toArray = function (args, start) {
    var start = start || 0
    return Array.prototype.slice.call(args, start)
  }
  
  var serializeArray = function(form) {
    // Return value
    var retVal = '';

    // Getting ALL elements inside of form element
    var els = form.getElementsByTagName('*');

    // Looping through all elements inside of form and checking to see if they're "form elements"
    for( var idx = 0; idx < els.length; idx ++) {
      var el = els[idx];

      // According to the HTTP/HTML specs we shouldn't serialize disabled controls
      // Notice also that according to the HTTP/HTML standards we should also serialize the
      // name/value pair meaning that the name attribute are being used as the ID of the control
      // Though for Ra controls the name attribute will have the same value as the ID attribute
      if( !el.disabled && el.name && el.name.length > 0 ) {
        switch(el.tagName.toLowerCase()) {
          case 'input':
            switch( el.type ) {
              // Note we SKIP Buttons and Submits since there are no reasons as to why we 
              // should submit those anyway
              case 'checkbox':
              case 'radio':
                if( el.checked ) {
                  if( retVal.length > 0 ) {
                    retVal += '&';
                  }
                  retVal += el.name + '=' + encodeURIComponent(el.value);
                }
                break;
              case 'hidden':
              case 'password':
              case 'text':
                if( retVal.length > 0 ) {
                  retVal += '&';
                }
                retVal += el.name + '=' + encodeURIComponent(el.value);
                break;
            }
            break;
          case 'select':
          case 'textarea':
            if( retVal.length > 0 ) {
              retVal += '&';
            }
            retVal += el.name + '=' + encodeURIComponent(el.value);
            break;
        }
      }
    }
    return retVal;
  }

  /**
   * Exposing the public interface to the Utils module
   * @private
   */
  return {
    every: every,
    forEach: forEach,
    filter: filter,
    map: map,
    toArray: toArray,
    serializeArray: serializeArray
  }
})()

