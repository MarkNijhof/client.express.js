
ClientExpress.Response = (function(request, server) {
  
  var Response = function(request, server) {
    this.request = request;
    this.server = server;
    this.redirect_path = '';
    this.output = '';
  };
  
  Response.prototype.send = function(string) {
    this.output = string;
  };  
  
  Response.prototype.render = function(template) {
    this.send(template);
  };
  
  Response.prototype.redirect = function(path) {
    this.redirect_path = path;
  };
  
  Response.prototype.contentType = function(content_type) {
    
  };
  
  Response.prototype.process = function() {
    if (this.redirect_path != "") {
      this.server.log.information(302, 'GET ', this.redirect_path);
      var new_request = new ClientExpress.Request({
        method: 'get',
        fullPath: this.redirect_path,
        title: '',
        session: this.server.session,
        delegateToServer: function () {
          window.location.pathname = this.redirect_path;
        }
      });
      this.server.processRequest(new_request);
      return;
    } 
  };
    
  return Response;

})();
