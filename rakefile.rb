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

task :major do
  version = File.read('VERSION').strip.split('.')
  major = Integer(version[1]) + 1
  
  File.open('VERSION', 'w') {|f| f.write("#{major}.0.0") }
end

task :minor do
  version = File.read('VERSION').strip.split('.')
  minor = Integer(version[1]) + 1
  
  File.open('VERSION', 'w') {|f| f.write("#{version[0]}.#{minor}.0") }
end

task :patch do
  version = File.read('VERSION').strip.split('.')
  patch = Integer(version[2]) + 1
  
  File.open('VERSION', 'w') {|f| f.write("#{version[0]}.#{version[1]}.#{patch}") }
end

task :publish do
  version = File.read('VERSION').strip

  file = File.read('package.json')
  File.open('package.json', "w"){|f| f.write(file.gsub(/\"version\": \"\d+?\.\d+?\.\d+?\"/, "\"version\": \"#{version}\"")) }
end

