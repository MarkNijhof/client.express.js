
var buster = require("buster");

var setup = require("./window_setup_helper.js").setup();

buster.spec.expose();
var assertThat = buster.assert.that;

var spec = describe("client.express.eventBroker", function () {

  should("be able to register an event handler that handles the event", function () {
    var eventBroker = new ClientExpress.EventBroker();
    var eventTriggered = false;
    
    eventBroker.addListener('onload', function() { eventTriggered = true; });

    assertThat(eventTriggered).isFalse();
    
    eventBroker.fire({type: 'load'});
    
    assertThat(eventTriggered).isTrue();
  });

  should("be able to register multiple event handlers that all handles the event", function () {
    var eventBroker = new ClientExpress.EventBroker();
    var event_1_Triggered = false;
    var event_2_Triggered = false;
    
    eventBroker.addListener('onload', function() { event_1_Triggered = true; });
    eventBroker.addListener('onload', function() { event_2_Triggered = true; });

    assertThat(event_1_Triggered).isFalse();
    assertThat(event_2_Triggered).isFalse();
    
    eventBroker.fire({type: 'load'});
    
    assertThat(event_1_Triggered).isTrue();
    assertThat(event_2_Triggered).isTrue();
  });

  should("be able to register multiple event handlers for different events that only handles the specific event", function () {
    var eventBroker = new ClientExpress.EventBroker();
    var event_1_Triggered = false;
    var event_2_Triggered = false;
    
    eventBroker.addListener('onload', function() { event_1_Triggered = true; });
    eventBroker.addListener('onunload', function() { event_2_Triggered = true; });

    assertThat(event_1_Triggered).isFalse();
    assertThat(event_2_Triggered).isFalse();
    
    eventBroker.fire({type: 'load'});
    
    assertThat(event_1_Triggered).isTrue();
    assertThat(event_2_Triggered).isFalse();
    
    eventBroker.fire({type: 'unload'});
    
    assertThat(event_1_Triggered).isTrue();
    assertThat(event_2_Triggered).isTrue();
  });

  should("be able to unregister an event handler", function () {
    var eventBroker = new ClientExpress.EventBroker();
    var event_1_Triggered = false;
    var event_2_Triggered = false;
    
    var event_1_Handler = function() { event_1_Triggered = true; };
    var event_2_Handler = function() { event_2_Triggered = true; };
    
    eventBroker.addListener('onload', event_1_Handler);
    eventBroker.addListener('onload', event_2_Handler);

    eventBroker.fire({type: 'load'});
    
    assertThat(event_1_Triggered).isTrue();
    assertThat(event_2_Triggered).isTrue();

    event_1_Triggered = false;
    event_2_Triggered = false;

    eventBroker.removeListener('onload', event_1_Handler);

    eventBroker.fire({type: 'load'});
    
    assertThat(event_1_Triggered).isFalse();
    assertThat(event_2_Triggered).isTrue();
  });


});