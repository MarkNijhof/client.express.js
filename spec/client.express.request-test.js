
var buster = require("buster");

var setup = require("./window_setup_helper.js").setup();

buster.spec.expose();
var assertThat = buster.assert.that;

var spec = describe("client.express.request", function () {
  before(function () {
    setup.setup_window();
    setup.setup_document();
  });
  
  after(function() {
    setup.reset_window();
    setup.reset_document();
  });

  should("be able to create a proper request", function () {
    var delegateToServerTriggered = false;
    var request = new ClientExpress.Request({
      method: 'get',
      fullPath: 'http://example.com/url/something',
      title: 'document title',
      session: { test: true },
      delegateToServer: function () {
        delegateToServerTriggered = true;
      }
    });
    
    assertThat(request.path).equals('/url/something');
    assertThat(request.method).equals('get');
    assertThat(request.isHistoryRequest).isFalse();
    assertThat(request.title).equals('document title');
    assertThat(request.session.test).isTrue();
    
    assertThat(delegateToServerTriggered).isFalse();
    request.delegateToServer();
    assertThat(delegateToServerTriggered).isTrue();
  });

  should("be able to transform a query string to proper request body", function () {
    var delegateToServerTriggered = false;
    var request = new ClientExpress.Request({
      method: 'get',
      fullPath: 'http://example.com/url/something?key1=value1&key2=value2',
      title: 'document title',
      session: { test: true },
      delegateToServer: function () {
        delegateToServerTriggered = true;
      }
    });
    
    assertThat(request.body['key1']).equals('value1');
    assertThat(request.body.key2).equals('value2');
  });

  should("be able to define the request a history request", function () {
    var delegateToServerTriggered = false;
    var request = new ClientExpress.Request({
      method: 'get',
      fullPath: 'http://example.com/url/something?key1=value1&key2=value2',
      title: 'document title',
      session: { test: true },
      delegateToServer: function () {
        delegateToServerTriggered = true;
      }
    });
    
    request.HistoryRequest();
    
    assertThat(request.isHistoryRequest).isTrue();
  });

});