
/**
 * @depends client.express.server.js
 * @depends client.express.route.js
 * @depends client.express.router.js
 * @depends client.express.event.broker.js  
 * @depends client.express.event.listener.js
 * @depends client.express.request.js
 * @depends client.express.response.js
 * @depends client.express.logger.js
 * @depends client.express.utils.js
 * @depends client.express.require.js
 */
 
ClientExpress = {};

var __dirname = '';

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
