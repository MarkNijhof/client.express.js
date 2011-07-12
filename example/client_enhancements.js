

server.configure(function() {
  server.use(express.setTitle({ titleArgument: 'title' }));
  server.use(express.googleAnalytics());
  server.use(express.setContentElement("content"));
});

server.before('*', function(request, response, content_element, next) {
  $(content_element).fadeOut(function() { next(); });
});

server.after('*', function(request, response, content_element, next) {
  $(content_element).fadeIn(function() { next(); });
});

