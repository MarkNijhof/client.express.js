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
  var appCounter = 0;
  
  var Server = function() {
    this.version = '0.0.1';
    this.id = [new Date().valueOf(), appCounter++].join("-");
    this.router = new ClientExpress.Router();
    this.eventListener = new ClientExpress.EventListener();
    this.session = {};
  }
   
  Server.prototype.use = function(path, other_server) {
    var that = this;
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length-1);
    }
    
    var routes = other_server.router.routes;
    ClientExpress.utils.forEach(routes.get, function(other_route) {
      add_route(that, other_route.method, path + other_route.path, other_route.action);
    });
  };

  Server.prototype.get = function(path, action) { return add_route(this, 'get', path, action); };
  Server.prototype.post = function(path, action) { return add_route(this, 'post', path, action); };
  Server.prototype.put = function(path, action) { return add_route(this, 'put', path, action); };
  Server.prototype.del = function(path, action) { return add_route(this, 'del', path, action); };

  var add_route = function(server, method, path, action) {
    console.log("Register route: " + method.toUpperCase() + " " + path)
    server.router.registerRoute(method, path, action);
    return server;
  };

  Server.prototype.listen = function() { 
    var server = this;
    this.eventListener.registerEventHandlers(server); 
  };
  
  Server.prototype.processRequest = function(request) {
    var route = this.router.match(request.method, request.path);
    
    if (!route.resolved()) {
      console.log("Route not found on the client: delegating!")
      request.delegateToServer();
      return;
    }

    var response = new ClientExpress.Response(request);
    route.action(request, response);
    processResponse(response);
  };
  
  var processResponse = function(response) {
    console.log("processing: " + response.request.path);
  }
  
  return Server;
  
})();


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


ClientExpress.EventListener = (function(server) {
  
  var EventListener = function() {
  };
  
  EventListener.prototype.registerEventHandlers = function(server) {
    setup_onclick_event_handler(server);
    setup_onsubmit_event_handler(server);
    setup_onpopstate_event_handler(server);    
  };
  
  var setup_onclick_event_handler = function(server) {
    document.onclick = function() {
      var ev = arguments[0] || window.event;
      var element = ev.target || ev.srcElement;

      if (element.tagName.toLowerCase() == 'a') {
        var request = new ClientExpress.Request({
          method: 'get',
          fullPath: element.href,
          title: element.title,
          session: server.session,
          delegateToServer: function () {
            window.location.pathname = element.href;
          }
        });

        server.processRequest(request);
        return false;
      }
    };
  };

  var setup_onsubmit_event_handler = function(server) {
    document.onsubmit = function() {
      var ev = arguments[0] || window.event;
      var element = ev.target || ev.srcElement;
      
      if (element.tagName.toLowerCase() == 'form') {
        var self = this
      
        var request = new ClientExpress.Request({
          method: element.method,
          fullPath: [element.action, ClientExpress.utils.serializeArray(element)].join("?"),
          title: element.title,
          session: server.session,
          delegateToServer: function () {
            element.submit();
          }
        });

        server.processRequest(request);
        return false;
      }
    };
  };

  var setup_onpopstate_event_handler = function(server) {
    // if (window.addEventListener) {
    //   window.addEventListener('popstate', onPopStateHandler, false);
    // } else if (window.attachEvent) {
    //   window.attachEvent('onpopstate', onPopStateHandler);
    // }
  };
  
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
  };
    
  return Request;

})();


ClientExpress.Response = (function(request) {
  
  var Response = function(request) {
    this.request = request;
  };
  
  Response.prototype.request = function() { 
    return this.request; 
  };
  
  Response.prototype.send = function(string) {
    
  };  
  
  Response.prototype.render = function(template) {
    
  };
  
  Response.prototype.redirect = function(path) {
    
  };
  
  Response.prototype.contentType = function(content_type) {
    
  };
  
  return Response;

})();


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

