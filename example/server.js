
var configure_server = function(_server) {
  _server.configure(function(){
    _server.use(express.logger());
    _server.set('views', __dirname + '/views/');
    _server.use(express.methodOverride());
    _server.use(express.bodyParser());
    _server.use(express.cookieParser());
    _server.use(express.session({ secret: "secret key"}));
    _server.use(express.static(__dirname + './../'));
    _server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    _server.use(_server.router);

    _server.register('.html', require('ejs'));
    _server.set('view engine', 'html');
  });
}

var express = require('express');

var server = express.createServer();

configure_server(server);

server.use('/examples/processing_url_and_post_parameters', require(__dirname + '/examples/server_processing_url_and_post_parameters').sessionServer());

server.get('/', function(request, response) {
  response.render('home', { title: 'client.express.js - home', source: 'server' });
});

server.get('/guide', function(request, response) {
  response.render('guide', { title: 'client.express.js - guide', source: 'server' });
});

server.get('/applications', function(request, response) {
  response.render('applications', { title: 'client.express.js - applications', source: 'server' });
});

server.get('/examples', function(request, response) {
  response.render('examples', { title: 'client.express.js - examples', source: 'server' });
});

var port = process.env.PORT || 3000;
console.log("Listening on " + port);
server.listen(port);
