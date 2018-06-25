/* jshint strict: false */
'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['Gruntfile.js', 'app.js', 'routes/**/*.js', 'errors/**/*.js', 'lib/**/*.js', 'static/**/*.js', '!static/bower_components/**/*.js'],
      options: {
        node: true,
        esnext: true,
        bitwise: false,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        indent: 2,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        quotmark: true,
        regexp: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        smarttabs: true,
        browser: true,
        jquery: true
      }
    },

    clean: ['dist/js/bundle.js'],

    watch: {
      files: [ 'static/js/**/*.js', 'Gruntfile.js' ],
      less: {
        files: 'static/less/*.less',
        tasks: [ 'less' ]
      },
      tasks: [ 'default' ]
    },

    less: {
      development: {
        options: { strict: true },
        files: {
          'dist/css/style.css': 'static/less/style.less'
        }
      },
      production: {
        options: { cleancss: true },
        files: {
          'dist/css/style.css': 'static/less/style.less'
        }
      }
    },

    browserify: {
      dist: {
        src: ['static/js/main.js'],
        dest: 'dist/js/bundle.js',
        options: {
          bundleOptions: { debug: true },
          transform: []
        }
      }
    },

    notify: {
      built: {
        options: {
          title: '👍',
          message: 'Yay!'
        }
      }
    },
    concat: {
            options: {
                separator: '\n;\n\n'
            },

            js: {
                src: [
                    'public/bower_components/jquery/dist/jquery.min.js',
                    'public/bower_components/angular/angular.min.js',
                    'public/bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'public/bower_components/angular-ui-router/release/angular-ui-router.min.js',
                    'public/bower_components/ngstorage/ngStorage.min.js',
                    'public/bower_components/angular-bootstrap/ui-bootstrap.min.js',
                    'public/bower_components/toastr/toastr.min.js',
                    'public/assets/js/moment.min.js',
                    'public/bower_components/Chart.js/Chart.js',
                    'public/bower_components/angular-chart.js/dist/angular-chart.min.js' 
                    ],
                dest: 'public/build/all.min.js'
            },
            css: {
                src: [
                    'public/bower_components/bootstrap/dist/css/bootstrap.min.css',
                    'public/bower_components/toastr/toastr.min.css'
                    
                 ],
                dest: 'public/build/build.css'
            }

        },
  });

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s)
  grunt.registerTask('default', ['jshint', 'build']);
  grunt.registerTask('build', ['clean', 'less', 'browserify', 'notify','concat:css', 'concat:js']);

};
