
exports.setup = function() {
  return {
    setup_window: function() {
      global.window = { 
        history: {
          pushState: function() {}
        },
        event: function() {}
      };
    },

    reset_window: function() {
      global.window = undefined;
    },

    reset_window_pushstate: function() {
      global.window = { 
        history: {
          pushState: undefined
        },
        event: function() {}
      };
    },
    
    setup_document: function() {
      global.document = {
        getElementsByTagName: function() { return []; },
        forms: [],
        childNodes: [null, null]
      };
    },
    
    reset_document: function() {
      global.document = undefined;
    }
  };
};
