
ClientExpress.Response = (function(request, server) {
  
  var Response = function(request, server) {
    this.request = request;
    this.server = server;
    this.redirect_path = '';
    this.output = '';
    this.title = request.title;
  };
  
  Response.prototype.send = function(string) {
    this.server.eventBroker.fire({
      type: 'Send',
      request: this.request,
      response: this,
      target_element: this.server.content_target_element,
      content: string
    });
  };  
  
  Response.prototype.render = function(template, args) {
    this.server.eventBroker.fire({
      type: 'Render',
      request: this.request,
      response: this,
      target_element: this.server.content_target_element,
      template: template,
      args: args
    });
  };
  
  Response.prototype.redirect = function(path) {
    this.server.eventBroker.fire({
      type: 'Redirect',
      request: this.request,
      response: this,
      originalUrl: (path.substr(0, 1) == "/" ? this.request.base_path : '') + path
    });
  };
    
  return Response;

})();
