

require.modules['ejs_original.js'] = require.modules['ejs.js'];

require.register("ejs.js", function(module, exports, require) {

  exports.compile = function(template_url, args) {
    var that = this;
    var template_html = that.cache.get(template_url);
    if (template_html == '') {
      $.ajax({ 
        type: "GET",
        url: template_url,   
        async: false,
        success : function(text) {
           template_html = text;
           that.cache.set(template_url, template_html);
        }
      });
    }
    return require("ejs_original").render(template_html, { locals: args });
  };
  
  exports.cache = {
    get: function(path) {
      return this.templates.hasOwnProperty(path) ?
        this.templates[path] : '';
    },
    set: function(path, template) {
      this.templates[path] = template;
    },
    templates: {}
  };

});