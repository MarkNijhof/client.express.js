
ClientExpress.formAndSessionServer = function() {
  var server = ClientExpress.createServer();

  server.get('/form_and_session/put_session', function(request, response) {
    response.render('form_and_session/put_session', {title: 'client.express.js - client', source: 'client' });
  });

  server.post('/form_and_session/put_session', function(request, response) {
    request.session.person = request.body.person;
    response.redirect('/form_and_session/read_session');
  });

  server.get('/form_and_session/read_session', function(request, response) {
    var person = request.session.person || {
      first_name: 'not set',
      last_name: 'not set'
    };
    response.render('form_and_session/read_session', {title: 'client.express.js - client', source: 'client', person: person });
  });

  return server;
};
