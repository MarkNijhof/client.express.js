// client.express.js JavaScript Routing, version: 0.5.5
// (c) 2011 Mark Nijhof
//
//  Released under MIT license.
//

ClientExpress = {};

ClientExpress.createServer = function() {
  return new ClientExpress.Server();
};

ClientExpress.supported = function() {
  return (typeof window.history.pushState == 'function')
};

ClientExpress.logger = function() {
  return function() {
    var server = this;
    var logger = new ClientExpress.Logger();
    server.eventBroker.addListener('onLog', function(event) {
      if (event.arguments.shift() == 'warning') {
        logger.warning(event.arguments);
        return;
      }
      logger.information(event.arguments);
    });
  };
};

ClientExpress.setTitle = function(options) {
  var titleArgument = (options && options.titleArgument);
  
  return function() {
    var server = this;
    server.eventBroker.addListener('onRequestProcessed', function(event) {
      var title;
      title = event.response.title;
      if (titleArgument && event.args[titleArgument]) {
        title = event.args[titleArgument];
      }
      if (title) {
        document.title = title
      }
    });
  };
};


ClientExpress.googleAnalytics = function() {
  return function() {
    var server = this;
    server.eventBroker.addListener('onRequestProcessed', function(event) {
      if (!event.isRedirect) {
        if (_gaq) {
          _gaq.push(['_trackPageview', event.request.originalUrl]);
        }
      }
    });
  };
};


ClientExpress.Server = (function() {
  var appCounter = 0;
  
  var Server = function() {
    this.version = '0.5.5';
    this.id = [new Date().valueOf(), appCounter++].join("-");
    this.settings = {};
    this.templateEngines = {};
    this.router = new ClientExpress.Router();
    this.eventListener = new ClientExpress.EventListener();
    this.eventBroker = new ClientExpress.EventBroker(this);
    this.session = {};
    this.content_target_element = document.childNodes[1];
    this.setup_functions = [];
        
    this.eventBroker.addListener('onProcessRequest', processRequestEventHandler);
    this.eventBroker.addListener('onRequestProcessed', requestProcessedEventHandler);
    this.eventBroker.addListener('onRender', renderEventHandler);
    this.eventBroker.addListener('onSend', sendEventHandler);
    this.eventBroker.addListener('onRedirect', redirectEventHandler); 
  }

  Server.prototype.log = function() {
    this.eventBroker.fire({
      type: 'Log',
      arguments: ClientExpress.utils.toArray(arguments)
    });
  };
  
  Server.prototype.content_target_area = function(id) {
    var server = this;
    return function() {
      var target_element = document.getElementById ? 
        document.getElementById(id) : 
        (document.all ? 
          document.all[id] : 
          (document.layers ? 
            document.layers[id] : 
            null) );

      server.content_target_element = target_element || document.childNodes[1]

      if (server.content_target_element == document.childNodes[1]) {
        this.log('warning', "Element \"", id, "\" could not be located!")
      }
    };
  };
  
  Server.prototype.configure = function(environment, configure_function) {
    if (typeof environment == 'function') {
      this.setup_functions.push(environment);
      return;
    }
    this.setup_functions.push(function() {
      if (server.enabled(environment)) {
        configure_function.call();
      }
    });    
  };
   
  Server.prototype.use = function(path, other_server) {
    if (typeof path == 'function') {
      path.call(this);
      return;
    }
    
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length-1);
    }
    
    var join_routes = function(base_path, route) {
      if (route instanceof RegExp) {
        var source = route.source
        if (source.substr(0, 1) == '^') {
          return new RegExp('^' + base_path + source.substr(1, source.length));
        }
        if (source.substr(0, 2) == '\\/') {
          return new RegExp(base_path + source);
        }
        return new RegExp(base_path + '/' + source);
      }
      
      if (route == '/') {
        return base_path;
      }      
      if (route.substr(0, 1) != '/') {
        return base_path + '/' + route;
      }
      return base_path + route;
    };
    
    var server = this;
    var routes = other_server.router.routes;
    
    var routes = routes.get.concat(
                   routes.post.concat(
                     routes.put.concat(
                       routes.del
                     )
                   )
                 );
                 
    ClientExpress.utils.forEach(routes, function(other_route) {
      add_route(server, other_route.method, join_routes(path, other_route.path), other_route.action, path);
    });
  };
  
  Server.prototype.set = function(setting, val){
    if (val === undefined) {
      if (this.settings.hasOwnProperty(setting)) {
        return this.settings[setting];
      } else if (this.parent) {
        return this.parent.set(setting);
      }
    } else {
      this.settings[setting] = val;
      return this;
    }
  };
  
  Server.prototype.enable = function(setting) {
    if (this.settings.hasOwnProperty(setting)) {
      this.settings[setting] = true;
    } else {
      this.settings[setting] = true;
    }
  }
  
  Server.prototype.disable = function(setting) {
    if (this.settings.hasOwnProperty(setting)) {
      this.settings[setting] = false;
    } else {
      this.settings[setting] = false;
    }
  }
  
  Server.prototype.enabled = function(setting) {
    return this.settings.hasOwnProperty(setting) && this.settings[setting];
  }
  
  Server.prototype.disabled = function(setting) {
    return this.settings.hasOwnProperty(setting) && !this.settings[setting];
  }
  
  Server.prototype.register = function(ext, template_engine){
    if (template_engine === undefined) {
      if (this.templateEngines.hasOwnProperty(ext)) {
        return this.templateEngines[ext];
      } else if (this.parent) {
        return this.parent.set(ext);
      }
    } else {
      this.templateEngines[ext] = template_engine;
      return this;
    }
  };
  
  Server.prototype.get  = function(path, action) { return add_route(this, 'get',  path, action, ''); };
  Server.prototype.post = function(path, action) { return add_route(this, 'post', path, action, ''); };
  Server.prototype.put  = function(path, action) { return add_route(this, 'put',  path, action, ''); };
  Server.prototype.del  = function(path, action) { return add_route(this, 'del',  path, action, ''); };

  var add_route = function(server, method, path, action, base_path) {
    server.router.registerRoute(method, path, action, base_path);
    return server;
  };
  
  Server.prototype.listen = function() { 
    if (!ClientExpress.supported()) {
      this.log('information', "Not supported on this browser");
      return;
    }
    
    var server = this;
    ClientExpress.onDomReady(function() {
      ClientExpress.utils.forEach(server.setup_functions, function(setup_function) {
        setup_function.call(server);
      });
      server.eventListener.registerEventHandlers(server); 
      
      replaceState(new ClientExpress.Request({
        method: 'get',
        originalUrl: window.location.href,
        title: document.title,
        session: server.session,
        delegateToServer: function () {
          window.location = window.location.href;
        }
      }));
      
      server.log('information', "Listening");
      var routes = server.router.routes.get.concat(
                     server.router.routes.post.concat(
                       server.router.routes.put.concat(
                         server.router.routes.del
                       )
                     )
                   ).sortByName('path');
                   
      ClientExpress.utils.forEach(routes, function(route) {
        server.log('information', 'Route registered:', route.method.toUpperCase().lpad("    "), route.path);
      });
    });
  };
  
  var pushState = function(request) {
    history.pushState(request, request.title, request.location());
  };
  
  var replaceState = function(request) {
    history.replaceState(request, request.title, request.location());
  };
  
  var processRequestEventHandler = function(event) {
    var server = this;
    var request = event.request;
    var route = this.router.match(request.method, request.originalUrl);
    
    if (!route.resolved()) {
      this.log('information', 404, request.method.toUpperCase().lpad("    "), request.originalUrl);
      event.request.delegateToServer();
      return;
    }
  
    this.log('information', 200, request.method.toUpperCase().lpad("    "), request.originalUrl);
  
    request.attachRoute(route);
    var response = new ClientExpress.Response(request, server);

    route.action(request, response);
  };
  
  var requestProcessedEventHandler = function(event) {
    if (!event.request.isHistoryRequest && !event.request.isRedirect) {
      // if (event.request.)
      pushState(event.request);
    }    
  }
  
  var renderEventHandler = function(event) {
    var views = this.settings['views'] || "";
    var ext = this.settings['view engine'] || "";
    
    var template = views + event.template;

    if (template.lastIndexOf(".") != -1 && template.lastIndexOf(".") <= 4) {
      ext = template.substr(template.lastIndexOf(".") - 1, template.length);
      template = template.substr(0, template.lastIndexOf(".") - 1);
    }
    var ext = ext || this.settings['view engine'] || "";
    
    if (ext != "") {
      ext = "." + ext;
      template = template + ext;
    }
    
    var templateEngine = this.templateEngines[ext];
    
    event.target_element.innerHTML = templateEngine.compile(template, event.args);

    this.eventBroker.fire({
      type: 'RequestProcessed',
      request: event.request,
      response: event.response, 
      target_element: event.target_element,
      args: event.args || {}
    });    
  };
  
  var sendEventHandler = function(event) {
    event.target_element.innerHTML = event.content;
    
    this.eventBroker.fire({
      type: 'RequestProcessed',
      request: event.request,
      response: event.response, 
      target_element: event.target_element,
      args: {}
    });    
  };
  
  var redirectEventHandler = function(event) {
    this.log('information', 302, 'GET ', event.originalUrl);
    
    var request = new ClientExpress.Request({
      method: 'get',
      originalUrl: event.originalUrl,
      title: '',
      isRedirect: true,
      session: event.request.session,
      delegateToServer: function () {
        window.location.originalUrlname = event.originalUrl;
      }
    });

    this.eventBroker.fire({
      type: 'ProcessRequest',
      request: request
    });
    
    this.eventBroker.fire({
      type: 'RequestProcessed',
      request: event.request,
      response: event.response, 
      target_element: event.target_element,
      args: {}
    });    
  };
  
  return Server;
  
})();



ClientExpress.Route = (function(method, path, action, options) {
  
  var Route = function(method, path, action, base_path, options) {
    this.resolved    = function() { return true; };
    this.method      = method;
    this.path        = path;
    this.action      = action;
    this.base_path   = base_path;
    this.params      = [];
    this.regexp      = normalize(path, this.keys = [], options.sensitive);
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
    if (path instanceof RegExp) {
      return path; 
    }
    
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


ClientExpress.EventBroker = (function(server) {
  
  var EventBroker = function(server) {
    this.server = server;
    this.eventListeners = {};
  };
  
  EventBroker.prototype.addListener = function(type, listener){
    if (typeof this.eventListeners[type] == "undefined"){
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  };

  EventBroker.prototype.removeListener = function(type, listener){
    if (this.eventListeners[type] instanceof Array) {
      var listeners = this.eventListeners[type];
      listeners.forEach(function(item, index) {
        if (item === listener) {
          listeners.splice(index, 1);
          return;
        }
      });
    }
  };
  
  EventBroker.prototype.fire = function(event){
    if (typeof event == "string"){
      event = { type: event };
    }
    if (!event.target){
      event.target = this.server;
    }

    if (!event.type){  //falsy
      throw new Error("Event object missing 'type' property.");
    }
    
    event.type = 'on' + event.type;
    
    if (this.eventListeners[event.type] instanceof Array){
      var listeners = this.eventListeners[event.type];
      listeners.forEach(function(item) {
        item.call(this.server, event);
      });
    }
  };
    
  return EventBroker;
  
})();



ClientExpress.EventListener = (function() {
  
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
          originalUrl: element.href,
          title: element.title || '',
          session: server.session,
          delegateToServer: function () {
            if (~element.href.indexOf("://")) {
              window.location = element.href;
              return;
            }
            window.location.pathname = element.href;
          }
        });

        server.eventBroker.fire({
          type: 'ProcessRequest',
          request: request
        });
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
          originalUrl: element.action,
          body: ClientExpress.utils.serializeArray(element),
          title: element.title,
          session: server.session,
          delegateToServer: function () {
            element.submit();
          }
        });

        server.eventBroker.fire({
          type: 'ProcessRequest',
          request: request
        });
        return false;
      }
    };
  };

  var setup_onpopstate_event_handler = function(server) {
    window.onpopstate = function(event) {
      if (event.state) {
        var request = event.state
        request.__proto__ = ClientExpress.Request.prototype
        request.HistoryRequest();
        
        server.eventBroker.fire({
          type: 'ProcessRequest',
          request: request
        });
      }
    };
  };
  
  return EventListener;  
})();


ClientExpress.Request = (function(raw_data) {
  
  var Request = function(raw_data) {
    var self = this;
    this.isHistoryRequest = false;
    this.session = raw_data.session;
    this.title = raw_data.title;
    this.body = {};
    this.params = {};
    this.query = {};
    this.base_path = '';
    this.isRedirect = raw_data.isRedirect || false;
    
    var queryString = raw_data.originalUrl.split("?")[1];
    var bodyString = raw_data.body;
    this.processQueryString(queryString, this.query);
    this.processQueryString(bodyString, this.body);

    this.method = (this.body._method || raw_data.method).toLowerCase();
    this.originalUrl = raw_data.originalUrl.replace(window.location.protocol + '//' + window.location.host, '');
    this.routePath = this.originalUrl.replace(/\?.+$/, "");
    this.delegateToServer = raw_data.delegateToServer || function() {};
  };

  Request.prototype.processQueryString = function(queryString, object) {
    if (queryString) {
      ClientExpress.utils.forEach(queryString.split("&"), function (keyval) {
        var paramName = keyval.split("=")[0],
            paramValue = keyval.split("=")[1],
            nestedParamRegex = /^(\w+)\[(\w+)\]/,
            nested;

        if (nested = nestedParamRegex.exec(paramName)) {
          var paramParent = nested[1];
          var paramName = nested[2];
          var parentParams = object[paramParent] || {};
          parentParams[paramName] = paramValue;
          object[paramParent] = parentParams;
        } else {
          object[paramName] = paramValue;
        };
      });
    }
  };
  
  Request.prototype.attachRoute = function(route) {
    this.params = route.params;
    this.base_path = route.base_path;
    this.routePath = route.path;
  };
  
  Request.prototype.location = function () {
    return (this.method === 'get') ? this.originalUrl : ''
  }
  
  Request.prototype.param = function (name) {
    return this.params[name] || this.body[name] || this.query[name] || undefined;
  }
  
  Request.prototype.HistoryRequest = function () {
    this.isHistoryRequest = true;
  }
    
  return Request;

})();


ClientExpress.Response = (function(request, server) {
  
  var Response = function(request, server) {
    this.request = request;
    this.server = server;
    this.redirect_path = '';
    this.output = '';
    this.title = request.title;
  };
  
  Response.prototype.send = function(string) {
    this.server.eventBroker.fire({
      type: 'Send',
      request: this.request,
      response: this,
      target_element: this.server.content_target_element,
      content: string
    });
  };  
  
  Response.prototype.render = function(template, args) {
    this.server.eventBroker.fire({
      type: 'Render',
      request: this.request,
      response: this,
      target_element: this.server.content_target_element,
      template: template,
      args: args
    });
  };
  
  Response.prototype.redirect = function(path) {
    this.server.eventBroker.fire({
      type: 'Redirect',
      request: this.request,
      response: this,
      originalUrl: (path.substr(0, 1) == "/" ? this.request.base_path : '') + path
    });
  };
    
  return Response;

})();


ClientExpress.Logger = (function() {
  
  var Logger = function() {
  };
  
  var formatString = function (args) {
    return args[0].join(' ');
  }

  Logger.prototype.error = function () {
    if (window.console) {
      console.error(formatString(arguments));
    }
  };

  Logger.prototype.information = function () {
    if (window.console) {
      console.log(formatString(arguments));
    }
  };

  Logger.prototype.warning = function () {
    if (window.console) {
      console.warn(formatString(arguments));
    }
  };
  
  return Logger;

})();



String.prototype.rpad = function(padding) { 
  return( padding.substr(0, (padding.length-this.length) ) + this ); 
};

String.prototype.lpad = function(padding) { 
  return( this + padding.substr(0, (padding.length-this.length) ) ); 
};

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

  if (!Array.prototype.sortByName) {
    Array.prototype.sortByName = function(name) {
      var array = this;
      if (array === void 0 || array === null) throw new TypeError();

      if (typeof name !== "string") throw new TypeError();
      
      return array.sort(function(a, b){
        var nameA = (a[name] instanceof RegExp ? a[name].source : a[name]).toLowerCase();
        var nameB = (b[name] instanceof RegExp ? b[name].source : b[name]).toLowerCase();
        
        return (nameA < nameB) ?
          -1 :
          (nameA > nameB) ?
            1 :
            0;
      });
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
  };
  
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
  };
  
  var objectIterator = function(object, callback) {
    for (var member in object) {
      callBackValue = {
        isFunction: object[member] instanceof Function,
        name: member,
        value: object[member]
      };
      callback(callBackValue);
    }
  };
    

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
    serializeArray: serializeArray,
    objectIterator: objectIterator
  }
})()

