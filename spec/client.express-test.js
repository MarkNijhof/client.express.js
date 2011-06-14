
var buster = require("buster");

var pushstate = require("./window_setup_helper.js").pushstate();

buster.spec.expose();
var assertThat = buster.assert.that;

var spec = describe("client.express", function () {
  before(function () {
    pushstate.setup_window();
  });
  
  after(function() {
    pushstate.reset_window();
  });

  should("return true with the existence of push state", function () {
    var pushState = ClientExpress.supported();
    assertThat(pushState).isTrue();
  });

  should("return false with the non-existence of push state", function () {
    pushstate.reset_window_pushstate();
    
    var pushState = ClientExpress.supported();
    assertThat(pushState).isFalse();
  });

  should("be able to create a new server", function () {
    var server = ClientExpress.createServer();
    assertThat(server).equals(new ClientExpress.Server());
  });

  should("return the version number", function () {
    var server = ClientExpress.createServer();
    assertThat(server.version()).equals('@VERSION');
  });
});