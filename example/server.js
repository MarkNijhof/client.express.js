
var express = require('express');

var server = express.createServer();

server.configure(function(){
  server.use(express.logger());
  server.set('views', __dirname + '/views/');
  server.use(express.methodOverride());
  server.use(express.bodyParser());
  server.use(express.cookieParser());
  server.use(express.session({ secret: "secret key"}));
  server.use(express.static(__dirname + './../'));
  server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  server.use(server.router);

  server.register('.html', require('ejs'));
  server.set('view engine', 'html');
});

server.use('/examples/processing_url_and_post_parameters', require(__dirname + '/examples/server_processing_url_and_post_parameters').processingUrlAndPostParameters());
server.use('/examples/routing', require(__dirname + '/examples/server_routing').routing());

server.get('/', function(request, response) {
  response.render('home', { title: 'Client Express JS - Home', source: 'server' });
});

server.get('/guide', function(request, response) {
  response.render('guide', { title: 'Client Express JS - Guide', source: 'server' });
});

server.get('/applications', function(request, response) {
  response.render('applications', { title: 'Client Express JS - Applications', source: 'server' });
});

server.get('/examples', function(request, response) {
  response.render('examples', { title: 'Client Express JS - Examples', source: 'server' });
});

var port = process.env.PORT || 3000;
console.log("Listening on " + port);
server.listen(port);
