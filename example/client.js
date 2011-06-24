
var server = ClientExpress.createServer();

server.configure(function() {
  server.use(server.content_target_area("content"));
  server.set('views', '/example/views/');
  server.set('view engine', 'html');
  server.register('.html', template_engine);
});

server.configure('development', function() {
  server.use(server.logger());
});

server.enable('development');

server.use('/examples', ClientExpress.formAndSessionServer());

server.get('/', function(request, response) {
  response.render('home', { title: 'client.express.js - home', source: 'client' });
});

server.get('/guide', function(request, response) {
  response.render('guide', { title: 'client.express.js - guide', source: 'client' });
});

server.get('/applications', function(request, response) {
  response.render('applications', { title: 'client.express.js - applications', source: 'client' });
});

server.get('/examples', function(request, response) {
  response.render('examples', { title: 'client.express.js - examples', source: 'client' });
});



server.get('/person/:person_name', function(request, response) {
  response.render('person', { title: 'client.express.js - client', source: 'client', person_name: request.params.person_name });
});

server.get('/person/first_name/:first_name/last_name/:last_name', function(request, response) {
  response.render('person', { title: 'client.express.js - client', source: 'client', person_name: request.params.first_name + ' ' + request.params.last_name });
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
