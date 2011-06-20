
ClientExpress.sessionServer = function() {
  var server = ClientExpress.createServer();

  server.get('/put_session', function(request, response) {
    response.render('put_session', { title: 'client.express.js - client', source: 'client' });
  });

  server.post('/put_session', function(request, response) {
    request.session.person = request.body.person;
    response.redirect('/read_session');
  });

  server.get('/read_session', function(request, response) {
    var person = request.session.person || {
      first_name: 'not set',
      last_name: 'not set'
    };
    response.render('read_session', { title: 'client.express.js - client', source: 'client', person: person });
  });
  
  return server;
};
