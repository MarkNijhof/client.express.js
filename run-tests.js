#!/usr/bin/env node

require.paths.unshift('.');

var glob = require("glob");

glob.glob("./src/**/*.js", function (err, files) {
  files.forEach(function (f) {
    console.log('require("./"' + f + ');')
    require("./" + f);
  });
});

glob.glob("spec/**/*-test.js", function (err, files) {
  files.forEach(function (f) {
    require("./" + f);
  });
});