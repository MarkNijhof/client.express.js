
var server = ClientExpress.createServer();

server.configure(function() {
  server.use(ClientExpress.setTitle({ titleArgument: 'title' }));
  server.use(ClientExpress.googleAnalytics());
  server.use(server.content_target_area("content"));
  server.set('views', '/example/views/');
  server.set('view engine', 'html');
  server.register('.html', template_engine);
});

server.configure('development', function() {
  server.use(ClientExpress.logger());
});

server.enable('development');

server.use('/examples/processing_url_and_post_parameters', ClientExpress.processingUrlAndPostParameters());
server.use('/examples/routing', ClientExpress.routing());

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
