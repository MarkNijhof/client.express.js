
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
          title: element.title || '',
          session: server.session,
          delegateToServer: function () {
            if (element.href.substr(0, 4) == 'http') {
              window.location = element.href;
              return;
            }
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
