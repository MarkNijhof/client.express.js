
var express = require('express');

exports.routing = function() {
  var server = express.createServer();

  server.get('/', function(request, response) {
    response.render('routing/routes', {title: 'Client Express JS - Example - Basic and advanced routing', source: 'server' });
  });

  server.get('/user/:id', function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /user/:id - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) 
    });
  });

  server.get('/users/:id?', function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /users/:id? - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) 
    });
  });

  server.get('/files/*', function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /files/* - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) // used to display the request values
    });
  });

  server.get('/file/*.*', function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /file/*.* - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) // used to display the request values
    });
  });

  server.get('/person/:id/:operation?', function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /person/:id/:operation? - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) // used to display the request values
    });
  });

  server.get('/product.:format', function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /product.:format - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) // used to display the request values
    });
  });

  server.get('/products.:format?', function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /products.:format? - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) // used to display the request values
    });
  });

  server.get('/persons/:id.:format?', function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /persons/:id.:format? - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) // used to display the request values
    });
  });

  server.get(/\/regex\/([^\/]+)\/?/, function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /\/regex\/([^\/]+)\/?/ - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) // used to display the request values
    });
  });

  server.get(/^\/regexp?(?:\/(\d+)(?:\.\.(\d+))?)?/, function(request, response) {
    response.render('routing/output', {
      title: 'Client Express JS - /^\/regexp?(?:\/(\d+)(?:\.\.(\d+))?)?/ - Basic and advanced routing', 
      source: 'server', 
      processedRequest: processRequestObject(request) // used to display the request values
    });
  });

  var getPropertiesToLi = function(theObject) {
    var result = '';
    for (var member in theObject) {
      if (typeof member == 'function' || typeof theObject[member] == 'function') {
        continue;
      }
      result = result + "<li>"+ member +": "+ theObject[member] +"</li>";
    }
    return result;
  }

  var processRequestObject = function(request) {
    var _params = getPropertiesToLi(request.params);
    var _body = getPropertiesToLi(request.body);
    var _query = getPropertiesToLi(request.query);

    return {
      url: request.originalUrl,
      query: _query,
      params: _params,
      body: _body
    };
  };  
  
  return server;
}
