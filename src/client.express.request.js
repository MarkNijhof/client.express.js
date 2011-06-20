
ClientExpress.Request = (function(raw_data) {
  
  var Request = function(raw_data) {
    var self = this;
    this.session = raw_data.session;
    this.body = {};
    this.title = raw_data.title;
    this.params;
    this.queryString = raw_data.fullPath.split("?")[1];

    if (this.queryString) {
      ClientExpress.utils.forEach(this.queryString.split("&"), function (keyval) {
        var paramName = keyval.split("=")[0],
            paramValue = keyval.split("=")[1],
            nestedParamRegex = /^(\w+)\[(\w+)\]/,
            nested;

        if (nested = nestedParamRegex.exec(paramName)) {
          var paramParent = nested[1];
          var paramName = nested[2];
          var parentParams = self.body[paramParent] || {};
          parentParams[paramName] = paramValue;
          self.body[paramParent] = parentParams;
        } else {
          self.body[paramName] = paramValue;
        };
      });
    };

    this.method = (this.body._method || raw_data.method).toLowerCase();
    this.path = raw_data.fullPath.replace(/\?.+$/, "").replace(window.location.protocol + '//' + window.location.host, '');
    this.delegateToServer = raw_data.delegateToServer || function() {};
  };
  
  Request.prototype.attachRoute = function(route) {
    this.params = route.params;
    this.base_path = route.base_path;
  };
    
  return Request;

})();
