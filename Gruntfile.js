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
        dest: "dist/<%= pkg.name %>.<%= pkg.version %>.js",
        src: [
          "<%= concat.options.banner %>",
          "src/js/dashboard/dashboard.js",
          "src/js/dashboard/widget.js",
          "src/js/dashboard/widgetGroup.js",          
          "src/js/dashboard/chart/util.js",
          "src/js/dashboard/chart/colorScheme.js",
          "src/js/dashboard/chart/stoplight.js",
          "src/js/dashboard/chart/pie.js"
        ]
      },

      fulldeps: {
        dest: "dist/<%= pkg.name %>.deps.<%= pkg.version %>.js",
        src : [
          "<%= concat.options.banner %>",
          "lib/miso.ds.deps.0.4.0.js",
          "lib/d3.v3.js",
          "dist/lib/<%= pkg.name %>.<%= pkg.version %>.js"
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
      
      fullnodeps: {
        src : "dist/<%= pkg.name %>.<%= pkg.version %>.js",
        dest: "dist/<%= pkg.name %>.min.<%= pkg.version %>.js"
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-contrib-concat");

  grunt.registerTask('default', ['concat', 'uglify']);

};