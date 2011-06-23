var template_engine = {
  compile: function(template_url, args) {
    var template_html;
    $.ajax({ 
      type: "GET",
      url: template_url,   
      async: false,
      success : function(text) {
         template_html = text;
      }
    });
    return require("ejs").render(template_html, { locals: args });
  }
};

var configure_server = function(_server) {
  _server.use(_server.logger());
  _server.use(_server.content_target_area("content"));
  _server.set('views', '/example/views/');
  _server.set('view engine', 'html');
  _server.register('.html', template_engine);
}

var server = ClientExpress.createServer();

configure_server(server);

server.use('/session', ClientExpress.sessionServer());

server.get('/', function(request, response) {
  response.render('home', { title: 'client.express.js - home', source: 'client' });
});

server.get('/guide', function(request, response) {
  response.render('guide', { title: 'client.express.js - guide', source: 'client' });
});

server.get('/applications', function(request, response) {
  response.render('applications', { title: 'client.express.js - applications', source: 'client' });
});



server.get('/person/:person_name', function(request, response) {
  response.render('person', { title: 'client.express.js - client', source: 'client', person_name: request.params.person_name });
});

server.get('/person/first_name/:first_name/last_name/:last_name', function(request, response) {
  response.render('person', { title: 'client.express.js - client', source: 'client', person_name: request.params.first_name + ' ' + request.params.last_name });
});

server.listen();
