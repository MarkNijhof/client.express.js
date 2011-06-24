
ClientExpress.processingUrlAndPostParameters = function() {
  var server = ClientExpress.createServer();

  server.get('/', function(request, response) {
    response.render('processing_url_and_post_parameters/form', {title: 'client.express.js - client', source: 'client' });
  });

  server.post('/', function(request, response) {
    var person = request.body.person;
    response.redirect('/person/' + person.first_name + '/' + person.last_name);
  });

  server.get('/person/:first_name/:last_name', function(request, response) {
    request.session.person = {
      first_name: request.params.first_name,
      last_name: request.params.last_name
    };
    response.redirect('/output');
  });

  server.get('/output', function(request, response) {
    var person = request.session.person || {
      first_name: 'not set',
      last_name: 'not set'
    };
    response.render('processing_url_and_post_parameters/output', {title: 'client.express.js - client', source: 'client', person: person });
  });

  return server;
};
