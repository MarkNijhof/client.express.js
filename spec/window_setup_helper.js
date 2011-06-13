
exports.pushstate = function() {
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
    }
  };
};
