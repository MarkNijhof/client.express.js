
ClientExpress.Request = (function(raw_data) {
  
  var Request = function(raw_data) {
    var self = this;
    this.params = {};
    this.title = raw_data.title;
    this.queryString = raw_data.fullPath.split("?")[1];

    if (this.queryString) {
      Davis.utils.forEach(this.queryString.split("&"), function (keyval) {
        var paramName = keyval.split("=")[0],
            paramValue = keyval.split("=")[1],
            nestedParamRegex = /^(\w+)\[(\w+)\]/,
            nested;

        if (nested = nestedParamRegex.exec(paramName)) {
          var paramParent = nested[1];
          var paramName = nested[2];
          var parentParams = self.params[paramParent] || {};
          parentParams[paramName] = paramValue;
          self.params[paramParent] = parentParams;
        } else {
          self.params[paramName] = paramValue;
        };
      });
    };

    this.method = (this.params._method || raw_data.method).toLowerCase();
    this.path = raw_data.fullPath.replace(/\?.+$/, "");
    // this.delegateToServer = raw_data.delegateToServer || Davis.noop;
    // this.isForPageLoad = raw_data.forPageLoad || false;

    // if (Davis.Request.prev) Davis.Request.prev.makeStale(this);
    // Davis.Request.prev = this;
  };
  
  var request = Request.prototype;
    
  return Request;

})();
