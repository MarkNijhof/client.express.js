

server.configure(function() {
  server.use(express.setTitle({ titleArgument: 'title' }));
  server.use(express.googleAnalytics());
  server.use(express.setContentElement("content"));
});

server.before('*', function(request, response, args, content_element, next) {
  args.source = 'client';
  $(content_element).fadeOut(function() { next(); });
});

server.after('*', function(request, response, args, content_element, next) {
  $(content_element).fadeIn(function() { next(); });
});

