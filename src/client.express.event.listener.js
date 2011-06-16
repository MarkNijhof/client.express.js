
ClientExpress.EventListener = (function(server) {
  var _server;
  
  var EventListener = function(server) {
    _server = server;
  };
  
  var eventListener = EventListener.prototype;
  
  eventListener.registerEventHandlers = function() {

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

        _server.processRequest(request);
        return false;
      }
    };
    
    // if (window.addEventListener) {
    //   window.addEventListener('popstate', onPopStateHandler, false);
    // } else if (window.attachEvent) {
    //   window.attachEvent('onpopstate', onPopStateHandler);
    // }
    
  };

  return EventListener;  
})();
