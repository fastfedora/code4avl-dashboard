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
    
      buildinfo : "Package:   <%= pkg.title %>\n" + 
                  "Home Page: <%= pkg.homepage %>\n" + 
                  "Built On:  <%= grunt.template.today(\"yyyy/mm/dd hh:mm\") %>\n" +
                  "Version:   <%= pkg.version %>\n" + 
                  "Copyright: <%= grunt.template.today(\"yyyy\") %> <%= pkg.authors %>;\n",
      
      deps : {
        'miso' : { name: 'miso.ds.deps', version: '0.4.0' },
        'd3'   : { name: 'd3',           version: 'v3' }
      }
    },
    
    concat : {
      options: {
        banner : "<%= meta.banner %>"
      },

      fullnodeps: {
        dest: "build/<%= pkg.name %>.<%= pkg.version %>.js",
        src: [
          "<%= concat.options.banner %>",
          "src/js/dashboard.js",
          "src/js/dashboard/widget.js",
          "src/js/dashboard/widgetGroup.js",          
          "src/js/dashboard/chart/util.js",
          "src/js/dashboard/chart/colorScheme.js",
          "src/js/dashboard/chart/stoplight.js",
          "src/js/dashboard/chart/pie.js"
        ]
      },

      fulldeps: {
        dest: "build/<%= pkg.name %>.deps.<%= pkg.version %>.js",
        src : [
          "<%= concat.options.banner %>",
          "lib/<%= meta.deps.miso.name %>.<%= meta.deps.miso.version %>.js",
          "lib/<%= meta.deps.d3.name %>.<%= meta.deps.d3.version %>.js",
          "build/lib/<%= pkg.name %>.<%= pkg.version %>.js"
        ]
      },

      buildstatus : {
        options : {
          banner : "<%= meta.buildinfo %>"
        },
        dest : "build/build.info",
        src : [
          "<%= 'buildinfo' %>"
        ]
      }
    },
    
    uglify : {
      options: {
        banner: "<%= meta.banner %>"
      },
      
      fullnodeps: {
        src : "build/<%= pkg.name %>.<%= pkg.version %>.js",
        dest: "build/<%= pkg.name %>.min.<%= pkg.version %>.js"
      }
    },
    
    copy: {
      build: {
        files: [
          { expand: true, cwd: 'src/pkg/', src: ['**'],  dest: 'build/' },
          { expand: true, cwd: 'lib/', src: ['**'],  dest: 'build/lib/' },
          
          // Hack4Food Example
          { expand: true, 
            cwd: 'build/',
            src: ['<%= pkg.name %>.<%= pkg.version %>.js'],
            dest: 'build/examples/hack4food/lib/' },

          { expand: true, 
            cwd: 'lib/',
            src: ['<%= meta.deps.miso.name %>.<%= meta.deps.miso.version %>.js',
                  '<%= meta.deps.d3.name %>.<%= meta.deps.d3.version %>.js'], 
            dest: 'build/examples/hack4food/lib/' }
        ]
      },
      
      dist: {
        files: [
          { expand: true, cwd: 'build/', src: ['**'],  dest: 'dist/' }
        ]
      }
    },

    includereplace : {
      build: { 
        options: {
          globals: {
            'script.dashboard' : '<%= pkg.name %>.<%= pkg.version %>.js',
            'script.miso'      : '<%= meta.deps.miso.name %>.<%= meta.deps.miso.version %>.js',
            'script.d3'        : '<%= meta.deps.d3.name %>.<%= meta.deps.d3.version %>.js'
          },
          prefix: '{{',
          suffix: '}}'
        },
        src: 'src/pkg/**/*.html',
        dest: 'build/'
      }
    },

    clean: {
      build: ["build/"],
      dist:  ["dist/"]
    },    
      
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-include-replace");

  grunt.registerTask('default', ['clean:build', 'concat', 'uglify', 'copy:build', 'includereplace:build']);
  grunt.registerTask('dist', ['clean:dist', 'default', 'copy:dist']);

};