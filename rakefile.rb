$: << 'lib'

autoload :Bundler, 'bundler'
task :default => :test

desc 'Create bundled and minified source files.'
task :bundle do
  Bundler.bundle!
end

task :test do
  exec 'nodemon run-tests.js'
end

task :run do
  sh "nodemon example/server.js"
end

desc 'Generate the documentation'
task :docs do
  exec "dox --title 'Davis' src/davis.*.js > docs/index.html"
end