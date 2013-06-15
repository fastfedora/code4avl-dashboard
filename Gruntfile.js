module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    meta : {
      banner :  "/**\n" +
              " * <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today(\"m/d/yyyy\") %>\n" +
              " * <%= pkg.homepage %>\n" +
              " * Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.authors %>;\n" +
              " * License: <%= pkg.license %>\n" +
              " * <%= pkg.licenseUrl %>\n" +
              " */\n",
    
      lastbuild : "<%= grunt.template.today(\"yyyy/mm/dd hh:ss\") %>"
    },
    
    
    concat : {
      options: {
        banner : "<%= meta.banner %>"
      },

      fullnodeps: {
        dest: "dist/open-dashboard.<%= pkg.version %>.js",
        src: [
          "<%= concat.options.banner %>",
          "src/simple-dashboard.js"
        ]
      },

      fulldeps: {
        dest: "dist/open-dashboard.deps.<%= pkg.version %>.js",
        src : [
          "<%= concat.options.banner %>",
          "lib/miso.ds.deps.0.4.0.js",
          "lib/d3.v3.js",
          "dist/open-dashboard.<%= pkg.version %>.js"
        ]
      },

      buildstatus : {
        options : {
          banner : "<%= grunt.template.today(\"yyyy/mm/dd hh:ss\") %>"
        },
        dest : "dist/LASTBUILD",
        src : [
          "<%= 'lastbuild' %>"
        ]
      }
    },
    
    uglify: {
      options: {
        banner: "<%= meta.banner %>"
      },
      build: {
        src : "src/<%= pkg.name %>.js",
        dest: "build/<%= pkg.name %>.min.js"
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-contrib-concat");

  grunt.registerTask('default', ['concat', 'uglify']);

};