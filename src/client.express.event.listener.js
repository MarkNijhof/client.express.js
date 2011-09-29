
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
        try {
          var request = JSON.parse(event.state);
          request.__proto__ = ClientExpress.Request.prototype;
          request.HistoryRequest();

          server.eventBroker.fire({
            type: 'ProcessRequest',
            request: request
          });
        }
        catch(err) {}
      }
    };
  };
  
  return EventListener;  
})();
