
exports.setup = function() {
  return {
    setup_window: function() {
      global.window = { 
        history: {
          pushState: function() {}
        }
      };
    },

    reset_window: function() {
      global.window = undefined;
    },

    reset_window_pushstate: function() {
      global.window = { 
        history: {
          pushState: undefined
        }
      };
    },
    
    setup_document: function() {
      global.document = {
        getElementsByTagName: function() { return []; },
        forms: []
      };
    },
    
    reset_document: function() {
      global.document = undefined;
    }
  };
};
