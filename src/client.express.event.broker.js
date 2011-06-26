
ClientExpress.EventBroker = (function(server) {
  
  var EventBroker = function(server) {
    this.server = server;
    this.eventListeners = {};
  };
  
  EventBroker.prototype.addListener = function(type, listener){
    if (typeof this.eventListeners[type] == "undefined"){
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  };

  EventBroker.prototype.removeListener = function(type, listener){
    if (this.eventListeners[type] instanceof Array) {
      var listeners = this.eventListeners[type];
      listeners.forEach(function(item, index) {
        if (item === listener) {
          listeners.splice(index, 1);
          return;
        }
      });
    }
  };
  
  EventBroker.prototype.fire = function(event){
    if (typeof event == "string"){
      event = { type: event };
    }
    if (!event.target){
      event.target = this.server;
    }

    if (!event.type){  //falsy
      throw new Error("Event object missing 'type' property.");
    }
    
    event.type = 'on' + event.type;
    
    if (this.eventListeners[event.type] instanceof Array){
      var listeners = this.eventListeners[event.type];
      listeners.forEach(function(item) {
        item.call(this.server, event);
      });
    }
  };
    
  return EventBroker;
  
})();

