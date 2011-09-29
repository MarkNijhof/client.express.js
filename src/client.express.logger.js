
ClientExpress.Logger = (function() {
  
  var Logger = function() {
  };
  
  var formatString = function (args) {
    return args[0].join(' ');
  };

  Logger.prototype.error = function () {
    if (typeof console == "undefined") {
      return;
    }
    console.error(formatString(arguments));
  };

  Logger.prototype.information = function () {
    if (typeof console == "undefined") {
      return;
    }
    console.log(formatString(arguments));
  };

  Logger.prototype.warning = function () {
    if (typeof console == "undefined") {
      return;
    }
    console.warn(formatString(arguments));
  };
  
  return Logger;

})();

