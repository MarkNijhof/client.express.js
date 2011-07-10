
var __dirname = '/example';

var express = require('express');

var server = express.createServer();

server.configure(function() {
  server.use(express.logger());
  server.set('views', __dirname + '/views/');
  server.use(express.methodOverride());
  server.use(express.bodyParser());
  server.use(express.cookieParser());
  server.use(express.session({ secret: "secret key"}));
  server.use(express.static(__dirname + './../'));
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  server.use(server.router);

  server.use(express.setTitle({ titleArgument: 'title' }));
  server.use(express.googleAnalytics());
  server.use(server.content_target_area("content"));

  server.register('.html', require('ejs'));
  server.set('view engine', 'html');
});

server.use('/examples/processing_url_and_post_parameters', require(__dirname + '/examples/server_processing_url_and_post_parameters').processingUrlAndPostParameters());
server.use('/examples/routing', require(__dirname + '/examples/server_routing').routing());

server.get('/', function(request, response) {
  response.render('home', { title: 'Client Express JS - Home', source: 'client' });
});

server.get('/guide', function(request, response) {
  response.render('guide', { title: 'Client Express JS - Guide', source: 'client' });
});

server.get('/applications', function(request, response) {
  response.render('applications', { title: 'Client Express JS - Applications', source: 'client' });
});

server.get('/examples', function(request, response) {
  response.render('examples', { title: 'Client Express JS - Examples', source: 'client' });
});

server.listen();

var template_engine = {
  compile: function(template_url, args) {
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
    return require("ejs").render(template_html, { locals: args });
  },
  cache: {
    get: function(path) {
      return this.templates.hasOwnProperty(path) ?
        this.templates[path] : '';
    },
    set: function(path, template) {
      this.templates[path] = template;
    },
    templates: {}
  }
};
