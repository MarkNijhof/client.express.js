
ClientExpress.Logger = (function() {
  
  var Logger = function() {
    this.log_enabled = false;
  };
  
  var timestamp = function (){
    return "[" + Date() + "]";
  }

  var formatString = function (args) {
    var a = ClientExpress.utils.toArray(args)
    a.unshift(timestamp())
    return a.join(' ');
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

