
exports.attach = function(express_app) {
  express_app.get('/client.express/:file', function(request, response) {
    response.download(__dirname + '/dist/' + request.params['file']);
  });
};