
ClientExpress.Request = (function(raw_data) {
  
  var Request = function(raw_data) {
    var self = this;
    this.isHistoryRequest = false;
    this.session = raw_data.session;
    this.title = raw_data.title;
    this.body = {};
    this.params = {};
    this.query = {};
    this.base_path = '';
    this.isRedirect = raw_data.isRedirect || false;
    var queryString = raw_data.originalUrl.split("?")[1];
    var bodyString = raw_data.body;

    if (queryString) {
      ClientExpress.utils.forEach(queryString.split("&"), function (keyval) {
        var paramName = keyval.split("=")[0],
            paramValue = keyval.split("=")[1],
            nestedParamRegex = /^(\w+)\[(\w+)\]/,
            nested;

        if (nested = nestedParamRegex.exec(paramName)) {
          var paramParent = nested[1];
          var paramName = nested[2];
          var parentParams = self.query[paramParent] || {};
          parentParams[paramName] = paramValue;
          self.query[paramParent] = parentParams;
        } else {
          self.query[paramName] = paramValue;
        };
      });
    }

    if (bodyString) {
      ClientExpress.utils.forEach(bodyString.split("&"), function (keyval) {
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
    }

    this.method = (this.body._method || raw_data.method).toLowerCase();
    this.originalUrl = raw_data.originalUrl.replace(/\?.+$/, "").replace(window.location.protocol + '//' + window.location.host, '');
    this.delegateToServer = raw_data.delegateToServer || function() {};
  };
  
  Request.prototype.attachRoute = function(route) {
    this.params = route.params;
    this.base_path = route.base_path;
    this.path = route.path;
  };
  
  Request.prototype.location = function () {
    return (this.method === 'get') ? this.originalUrl : ''
  }
  
  Request.prototype.param = function (name) {
    return this.params[name] || this.body[name] || this.query[name] || undefined;
  }
  
  Request.prototype.HistoryRequest = function () {
    this.isHistoryRequest = true;
  }
    
  return Request;

})();
