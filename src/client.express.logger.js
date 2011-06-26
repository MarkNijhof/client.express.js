
ClientExpress.Logger = (function() {
  
  var Logger = function() {
  };
  
  var formatString = function (args) {
    return ClientExpress.utils.toArray(args).join(' ');
  }

  Logger.prototype.error = function () {
    if (window.console) {
      console.error(formatString(arguments));
    }
  };

  Logger.prototype.information = function () {
    if (window.console) {
      console.log(formatString(arguments));
    }
  };

  Logger.prototype.warning = function () {
    if (window.console) {
      console.warn(formatString(arguments));
    }
  };
  
  return Logger;

})();

