
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
  
  Response.prototype.render = function(template, args) {
    var views = this.server.settings['views'] || "";
    var ext = this.server.settings['view engine'] || "";
    
    template = views + template;

    if (template.lastIndexOf(".") != -1 && template.lastIndexOf(".") <= 4) {
      ext = template.substr(template.lastIndexOf(".") - 1, template.length);
      template = template.substr(0, template.lastIndexOf(".") - 1);
    }
    var ext = ext || this.server.settings['view engine'] || "";
    
    if (ext != "") {
      ext = "." + ext;
      template = template + ext;
    }
    
    var templateEngine = this.server.templateEngines[ext];
    
    this.send(templateEngine(template, args));
  };
  
  Response.prototype.redirect = function(path) {
    this.redirect_path = (path.substr(0, 1) == "/" ? this.request.base_path : '') + path;
  };
  
  Response.prototype.process = function() {
    var that = this;
    if (that.redirect_path != "") {
      that.server.log.information(302, 'GET ', that.redirect_path);
      var new_request = new ClientExpress.Request({
        method: 'get',
        fullPath: that.redirect_path,
        title: '',
        session: that.server.session,
        delegateToServer: function () {
          window.location.pathname = that.redirect_path;
        }
      });
      that.server.processRequest(new_request);
      return;
    } 
    that.server.content_target_element.innerHTML = that.output;
  };
    
  return Response;

})();
