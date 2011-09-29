 
ClientExpress = {};

var __dirname = '';
var process = { env: { PORT: 3000 } };

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

  
ClientExpress.setContentElement = function(content_id) {
  return function() {
    var server = this;
    var content_element = document.getElementById ? 
      document.getElementById(content_id) : 
      (document.all ? 
        document.all[content_id] : 
        (document.layers ? 
          document.layers[content_id] : 
          null) );

    server.content_element = content_element || document.childNodes[1]

    if (server.content_element == document.childNodes[1]) {
      this.log('warning', "Element '", content_id, "' could not be located!")
    }
  };
};

