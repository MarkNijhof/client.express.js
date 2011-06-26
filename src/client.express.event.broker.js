
ClientExpress.EventBroker = (function(server) {
  
  var EventBroker = function(server) {
    this.server = server;
    this._listeners = {};
  };
  
  EventBroker.prototype.addListener = function(type, listener){
    if (typeof this._listeners[type] == "undefined"){
      this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
  };

  EventBroker.prototype.removeListener = function(type, listener){
    if (this._listeners[type] instanceof Array) {
      var listeners = this._listeners[type];
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
    
    if (this._listeners[event.type] instanceof Array){
      var listeners = this._listeners[event.type];
      listeners.forEach(function(item) {
        item.call(this.server, event);
      });
    }
  };
    
  return EventBroker;
  
})();

