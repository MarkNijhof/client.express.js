
var buster = require("buster");

var setup = require("./window_setup_helper.js").setup();

buster.spec.expose();
var assertThat = buster.assert.that;

var spec = describe("client.express", function () {
  before(function () {
    setup.setup_window();
    setup.setup_document();
  });
  
  after(function() {
    setup.reset_window();
    setup.reset_document();
  });

  should("return true with the existence of push state", function () {
    var pushState = ClientExpress.supported();
    assertThat(pushState).isTrue();
  });

  should("return false with the non-existence of push state", function () {
    setup.reset_window_pushstate();
    
    var pushState = ClientExpress.supported();
    assertThat(pushState).isFalse();
  });

  should("be able to create a new server", function () {
    var server = ClientExpress.createServer();
    assertThat(server).typeOf('object');
  });

  should("return the version number", function () {
    var server = ClientExpress.createServer();
    assertThat(server.version).equals('@VERSION');
  });

  
  should("not create different servers", function () {
    var server1 = ClientExpress.createServer();
    var server2 = ClientExpress.createServer();
    
    assertThat(server1.id).notEquals(server2.id);
  });

});