
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
