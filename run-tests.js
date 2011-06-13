#!/usr/bin/env node

require.paths.unshift('.');

var glob = require("glob");

glob.glob("spec/**/*-test.js", function (err, files) {
  files.forEach(function (f) {
    require("./" + f);
  });
});