require 'fileutils'

require 'rubygems'

class Bundler
  DIST_DIR = File.expand_path('../../dist', __FILE__)
  SRC_DIR = File.expand_path('../../src', __FILE__)

  class << self
    def bundle!
      FileUtils.mkdir_p(DIST_DIR)

      sh "juicer merge -s #{SRC_DIR}/client.express.bundle.js -o #{DIST_DIR}/client.express.min-#{version}.js -m closure_compiler -f"
      sh "juicer merge -s #{SRC_DIR}/client.express.require.ejs.js -o #{DIST_DIR}/client.express.require.ejs.min-#{version}.js -m closure_compiler -f"
      
      write "#{DIST_DIR}/client.express.min-#{version}.js"
      write "#{DIST_DIR}/client.express.require.ejs.min-#{version}.js"
      
      sh "cp #{DIST_DIR}/client.express.min-#{version}.js #{DIST_DIR}/client.express.min-latest.js"
      sh "cp #{DIST_DIR}/client.express.require.ejs.min-#{version}.js #{DIST_DIR}/client.express.require.ejs.min-latest.js"
    end

    private
      def header
        @header ||= File.read(File.join(SRC_DIR, 'header.js'))
      end

      def version
        @version ||= File.read('VERSION').strip
      end

      def write(path)
        puts "Generating #{path}"
        
        content = ''
        File.open(path, 'r') do |f|
          content = f.read
        end
        File.open(path, 'w') do |f|
          f.write header.gsub('@VERSION', version)
          f.write content.gsub('@VERSION', version)
        end
      end
  end
end