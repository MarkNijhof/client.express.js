
var buster = require("buster");

var setup = require("./window_setup_helper.js").setup();

buster.spec.expose();
var assertThat = buster.assert.that;

var spec = describe("client.express.server", function () {
  before(function () {
    setup.setup_window();
    setup.setup_document();
  });
  
  after(function() {
    setup.reset_window();
    setup.reset_document();
  });

  should("accept a get route configuration", function () {
    var server = new ClientExpress.Server();
    
    server.get('/path', function(request, response) { });
    
    var route = server.router.match('get', '/path');
    
    assertThat(route).typeOf('object');
    assertThat(route.path).equals('/path');
  });

  should("return exists equals false when a url doesn't map to a route", function () {
    var server = new ClientExpress.Server();
    
    assertThat(server.router.match('get', '/path').resolved()).isFalse();
  });

  should("return exists equals true when a url does map to a route", function () {
    var server = new ClientExpress.Server();

    server.get('/path', function(request, response) { });
    
    assertThat(server.router.match('get', '/path').resolved()).isTrue();
  });

  should("accept a get route configuration with route variables", function () {
    var server = new ClientExpress.Server();
    
    server.get('/path/:id/something/:else?', function(request, response) {
      
    });

    var route = server.router.match('get', '/path/:id/something/:else?');
    
    assertThat(route).typeOf('object');
    assertThat(route.path).equals('/path/:id/something/:else?');
    assertThat(route.params.length).equals(2);
    assertThat(route.params[0].name).equals('id');
    assertThat(route.params[0].optional).isFalse();
    assertThat(route.params[1].name).equals('else');
    assertThat(route.params[1].optional).isTrue();
  });

  should("accept a post route configuration", function () {
    var server = new ClientExpress.Server();
    
    server.post('/path', function(request, response) {
      
    });
    
    var route = server.router.match('post', '/path');
    
    assertThat(route).typeOf('object');
    assertThat(route.path).equals('/path');
  });

  should("accept a put route configuration", function () {
    var server = new ClientExpress.Server();
    
    server.put('/path', function(request, response) {
      
    });
    
    var route = server.router.match('put', '/path');
    
    assertThat(route).typeOf('object');
    assertThat(route.path).equals('/path');
  });

  should("accept a delete route configuration", function () {
    var server = new ClientExpress.Server();
    
    server.del('/path', function(request, response) {
      
    });
    
    var route = server.router.match('del', '/path');
    
    assertThat(route).typeOf('object');
    assertThat(route.path).equals('/path');
  });

  should("accept a different route configurations with their actions", function () {
    var server = new ClientExpress.Server();
    
    server
      .get('/path', function(request, response) { return 'get'; })
      .post('/path', function(request, response) { return 'post'; })
      .put('/path', function(request, response) { return 'put'; })
      .del('/path', function(request, response) { return 'del'; });
    
    var get_route = server.router.match('get', '/path');
    var post_route = server.router.match('post', '/path');
    var put_route = server.router.match('put', '/path');
    var del_route = server.router.match('del', '/path');
    
    assertThat(get_route.action()).equals('get');
    assertThat(post_route.action()).equals('post');
    assertThat(put_route.action()).equals('put');
    assertThat(del_route.action()).equals('del');
  });

  should("be able to resolve different urls", function () {
    var server = new ClientExpress.Server();
    
    server
      .get('/path', function(request, response) { return '/path'; })
      .get('/path/:id?', function(request, response) { return '/path/:id?'; })
      .get('/path/:id/something/:else?', function(request, response) { return '/path/:id/something/:else?'; });

    assertThat(server.router.match('get', '/path').action()).equals('/path');
    assertThat(server.router.match('get', '/path/').action()).equals('/path');
    assertThat(server.router.match('get', '/path/mark').action()).equals('/path/:id?');
    assertThat(server.router.match('get', '/path/mark/something').action()).equals('/path/:id/something/:else?');
    assertThat(server.router.match('get', '/path/mark/something/').action()).equals('/path/:id/something/:else?');
    assertThat(server.router.match('get', '/path/mark/something/nijhof').action()).equals('/path/:id/something/:else?');
  });

  should("be able to combine different client.express servers", function () {
    var server = new ClientExpress.Server();

    var server1 = new ClientExpress.Server();
    server1.get('/path', function(request, response) { return '/path_server_1'; })

    var server2 = new ClientExpress.Server();
    server2.get('/path', function(request, response) { return '/path_server_2'; })
    
    server.use('/', server1);
    server.use('/server_2', server2);

    assertThat(server.router.match('get', '/path').action()).equals('/path_server_1');
    assertThat(server.router.match('get', '/server_2/path').action()).equals('/path_server_2');
  });
  
});