
ClientExpress.Logger = (function() {
  
  var Logger = function() {
    this.log_enabled = false;
  };
  
  var formatString = function (args) {
    return ClientExpress.utils.toArray(args).join(' ');
  }

  Logger.prototype.enable = function () {
    this.log_enabled = true;
  };

  Logger.prototype.error = function () {
    if (this.log_enabled && window.console) {
      console.error(formatString(arguments));
    }
  };

  Logger.prototype.information = function () {
    if (this.log_enabled && window.console) {
      console.info(formatString(arguments));
    }
  };

  Logger.prototype.warning = function () {
    if (this.log_enabled && window.console) {
      console.warn(formatString(arguments));
    }
  };
  
  return Logger;

})();

