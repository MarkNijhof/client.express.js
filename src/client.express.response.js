
ClientExpress.Response = (function(request) {
  var _request;
  
  var Response = function(request) {
    _request = request;
  };
  
  var response = Response.prototype;
  
  response.request = function() { 
    return _request; 
  };
  
  response.send = function(string) {
    
  };  
  
  response.render = function(template) {
    
  };
  
  response.redirect = function(path) {
    
  };
  
  response.contentType = function(content_type) {
    
  };
  
  return Response;

})();
