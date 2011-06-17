
ClientExpress = {};

ClientExpress.createServer = function() {
  return new ClientExpress.Server();
};

ClientExpress.supported = function() {
  return (typeof window.history.pushState == 'function')
};
