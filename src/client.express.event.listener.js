
ClientExpress.EventListener = (function(server) {
  var _server;
  
  var EventListener = function(server) {
    _server = server;
  };
  
  var eventListener = EventListener.prototype;
  
  eventListener.registerEventHandlers = function() {
    var links = document.getElementsByTagName('a');
    for (var i = 0, length = links.length, link = links[i]; i < length; i++) {
        var original_click = link.onclick;
        link.onclick = function(e) {
          if (original_click != null && !original_click()) {
              return false;
          }
          return onClickEventHandler(e, link);
        }
    }
    
    var forms = document.forms;
    for (var i = 0, length = forms.length, form = forms[i]; i < length; i++) {
      var original_submit = form.submit;
      form.submit = function(e) {
        if (original_submit != null && !original_submit()) {
            return false;
        }
        return onSubmitEventHandler(e, form);
      }
    }
    
    if (window.addEventListener) {
      window.addEventListener('popstate', onPopStateHandler, false);
    } else if (window.attachEvent) {
      window.attachEvent('onpopstate', onPopStateHandler);
    }
    
  };

  function onPopStateHandler(theEvent) {
  }
  
  function onClickEventHandler(theEvent, link) {
    var request = new ClientExpress.Request({
      method: 'get',
      fullPath: this.attr('href'),
      title: this.attr('title')
    });
    return _server.processRequest(request);
  };

  function onSubmitEventHandler(theEvent, theForm) {
    var extractFormParams = function (form) {
      return ClientExpress.utils.map(form.serializeArray(), function (attr) {
        return [attr.name, attr.value].join('=')
      }).join('&')
    }

    var request = new ClientExpress.Request({
      method: this.attr('method'),
      fullPath: [this.attr('action'), extractFormParams(this)].join("?"),
      title: this.attr('title')
    });
    return _server.processRequest(request);
  };

  // function AttachEvent(obj,evt,fnc,useCapture) {
  //   if (!useCapture) {
  //     useCapture=false; 
  //   }
  // 
  //   if (obj.addEventListener) {
  //     obj.addEventListener(evt,fnc,useCapture);
  //     return true;
  //   } else if (obj.attachEvent) {
  //     return obj.attachEvent("on"+evt,fnc);
  //   } else {
  //     MyAttachEvent(obj,evt,fnc);
  //     obj['on'+evt]=function() { MyFireEvent(obj,evt) };
  //   }
  // }
  // function MyAttachEvent(obj,evt,fnc) {
  //   if (!obj.myEvents) {
  //     obj.myEvents = {};
  //   }
  //   if (!obj.myEvents[evt]) {
  //     obj.myEvents[evt] = [];
  //   }
  //   var evts = obj.myEvents[evt];
  //   evts[evts.length] = fnc;
  // }
  // 
  // function MyFireEvent(obj,evt) {
  //   if (!obj || !obj.myEvents || !obj.myEvents[evt]) {
  //     return;
  //   }
  //   var evts = obj.myEvents[evt];
  //   for (var i=0,len=evts.length;i<len;i++) {
  //     evts();
  //   }
  // }
  // AttachEvent([I]element,'event',myFunction,false);
  
    
  return EventListener;

})();
