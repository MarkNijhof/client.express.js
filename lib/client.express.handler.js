
exports.attach = function(express_app) {
  express_app.get('/client.express/:file', function(request, response) {
    response.download(__dirname + './../node_modules/clientexpress/dist/' + request.params['file']);
  });
};