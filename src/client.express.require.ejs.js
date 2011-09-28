

require.modules['ejs_original.js'] = require.modules['ejs.js'];

require.register("ejs.js", function(module, exports, require) {
  function createXMLHttp() {
    if (typeof XMLHttpRequest != 'undefined') {
      return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      var avers = ["Microsoft.XmlHttp", "MSXML2.XmlHttp", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.5.0"];
      for (var i = avers.length -1; i >= 0; i--) {
        try {
          httpObj = new ActiveXObject(avers[i]);
          return httpObj;
        } catch(e) {}
      }
    }
    throw new Error('XMLHttp (AJAX) not supported');
  }

  exports.compile = function(template_url, args) {
    var that = this;
    var template_html = that.template_cache.get(template_url);
    if (template_html == '') {
      var ajaxObj = createXMLHttp();
      ajaxObj.open('GET', template_url, false);
      ajaxObj.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          template_html = this.responseText;
          that.template_cache.set(template_url, template_html);
        }
      };
      ajaxObj.send();
    }
    return require("ejs_original").render(template_html, { locals: args });
  };
  
  exports.template_cache = {
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