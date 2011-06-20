
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

server.use('/session', require(__dirname + '/server_session').sessionServer());

server.get('/', function(request, response) {
  response.render('home', {title: 'client.express.js - server', source: 'server' });
});

server.get('/contact', function(request, response) {
  response.render('contact', {title: 'client.express.js - server', source: 'server' });
});

server.get('/person/:person_name', function(request, response) {
  response.render('person', {title: 'client.express.js - server', source: 'server', person_name: request.params.person_name });
});

server.get('/person/first_name/:first_name/last_name/:last_name', function(request, response) {
  response.render('person', {title: 'client.express.js - server', source: 'server', person_name: request.params.first_name + ' ' + request.params.last_name });
});

var port = process.env.PORT || 3000;
console.log("Listening on " + port);
server.listen(port);
