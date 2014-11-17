module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build/', 'tmp/'],
    bowercopy: {
      options: {
        runBower: false
      },
      'angular-strap': {
        files: {
          'tmp/vendorjs/angular-strap.js': 'angular-strap/dist/angular-strap.js',
          'tmp/vendorjs/angular-strap.tpl.js': 'angular-strap/dist/angular-strap.tpl.js',
        }
      },
      'angular-ui-bootstrap-bower': {
        files: {
          'tmp/vendorjs/ui-bootstrap.js': 'angular-ui-bootstrap-bower/ui-bootstrap.js'
        }
      },
      angular: {
        files: {
          'tmp/vendorjs/angular.js': 'angular/angular.js'
        }
      },
      'angular-animate': {
        files: {
          'tmp/vendorjs/angular-animate.js': 'angular-animate/angular-animate.js'
        }
      },
      'angular-motion': {
        files: {
          'tmp/css/angular-motion.css': 'angular-motion/dist/angular-motion.css'
        }
      },
      restangular: {
        files: {
          'tmp/vendorjs/restangular.js': 'restangular/dist/restangular.js'
        }
      },
      bootstrap: {
        files: {
          'tmp/vendorjs/bootstrap.js': 'bootstrap/dist/js/bootstrap.js',
          'tmp/css/bootstrap.css': 'bootstrap/dist/css/bootstrap.css',
          'build/static/assets/fonts/': 'bootstrap/dist/fonts/*'
        }
      },
      'bootstrap-additions': {
        files: {
          'tmp/css/bootstrap-additions.css': 'bootstrap-additions/dist/bootstrap-additions.css'
        }
      },
      jquery: {
        files: {
          'tmp/vendorjs/jquery.js': 'jquery/dist/jquery.js',
        }
      },
      underscore: {
        files: {
          'tmp/vendorjs/underscore.js': 'underscore/underscore.js'
        }
      },
      requirejs: {
        files: {
          'tmp/vendorjs/require.js': 'requirejs/require.js'
        }
      },
      jssha: {
        files: {
          'tmp/vendorjs/sha256.js': 'jssha/src/sha256.js'
        }
      },
      snapjs: {
        files: {
          'tmp/vendorjs/snap.js': 'snapjs/snap.js',
          'tmp/css/snap.css': 'snapjs/snap.css'
        }
      },
      'angular-snap': {
        files: {
          'tmp/vendorjs/angular-snap.js': 'angular-snap/angular-snap.js',
          'tmp/css/angular-snap.css': 'angular-snap/angular-snap.css'
        }
      },
      'angular-bootstrap-colorpicker': {
        files: {
          'tmp/vendorjs/bootstrap-colorpicker-module.js': 'angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
          'tmp/css/colorpicker.css': 'angular-bootstrap-colorpicker/css/colorpicker.css'
        }
      },
      'angular-xeditable': {
        files: {
          'tmp/vendorjs/xeditable.js': 'angular-xeditable/dist/js/xeditable.js',
          'tmp/css/xeditable.css': 'angular-xeditable/dist/css/xeditable.css'
        }
      }
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            src: ['images/**', 'icons/**'],
            dest: 'build/static/assets/'
          },
          {
            expand: true,
            flatten: true,
            src: ['ncb/server.py', 'ncb/db.py', 'ncb/__init__.py'],
            dest: 'build'
          }
        ]
      },
      debug: {
        files: [
          {
            expand: true,
            src: ['images/**', 'icons/**'],
            dest: 'build/static/assets/'
          },
          {
            expand: true,
            flatten: true,
            src: ['tmp/css/styles.css'],
            dest: 'build/static/assets/css'
          },
          {
            expand: true,
            flatten: true,
            src: ['tmp/vendorjs/vendor.js'],
            dest: 'build/static/assets/js'
          },
          {
            expand: true,
            flatten: true,
            src: ['tmp/ncbjs/ncb.js'],
            dest: 'build/static/assets/js'
          },
          {
            expand: true,
            flatten: true,
            src: ['tmp/index.html'],
            dest: 'build/'
          },
          {
            expand: true,
            flatten: true,
            src: ['ncb/server.py', 'ncb/db.py', 'ncb/__init__.py'],
            dest: 'build'
          },
          {
          	expand: true,
          	flatten: true,
          	src: ['tmp/templates/colorpicker-popover.html'],
          	dest: 'build/static/assets/html'
          }
        ]
      }
    },
    bake: {	
      build: {
      	options:{
      		parsePattern:false
      	},
        files: {
          'tmp/index.html': 'html/index.html',
          'tmp/templates/colorpicker-popover.html': 'html/global/colorpicker-popover.html'
        }
      }
    },
    htmlmin: {
      build: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'build/static/index.html': 'tmp/index.html'
        }
      }
    },
    jshint: {
    	options: {
    		force: true
    	},
      all: ['Gruntfile.js', 'js/**.js']
    },
    less: {
      default: {
        files: {
          "tmp/css/ncb.css": "less/main.less"
        }
      }
    },
    mochaTest: {
      test: {
        src: ['js/tests/*.js']
      }
    },
    concat: {
      vendorjs: {
        src: [
          'tmp/vendorjs/jquery.js',
          'tmp/vendorjs/underscore.js',
          'tmp/vendorjs/bootstrap.js',
          'tmp/vendorjs/angular.js',
          'tmp/vendorjs/restangular.js',
          'tmp/vendorjs/angular-animate.js',
          'tmp/vendorjs/angular-strap.js',
          'tmp/vendorjs/angular-strap.tpl.js',
          'tmp/vendorjs/ui-bootstrap.js',
          'tmp/vendorjs/sha256.js',
          'tmp/vendorjs/snap.js',
          'tmp/vendorjs/angular-snap.js',
          'tmp/vendorjs/bootstrap-colorpicker-module.js',
          'tmp/vendorjs/xeditable.js'
        ],
        dest: 'tmp/vendorjs/vendor.js'
      },
      css: {
        src: ['tmp/css/*.css'],
        dest: 'tmp/css/styles.css'
      },
      ncbjs: {
        src: [
          'js/init.js',
          'js/json.js',
          'js/utilityFcns.js',
          'js/parameters.js',
          'js/app.js',
          'js/model.services.js',
          'js/builder.controllers.js',
          'js/sim.controllers.js'
        ],
        dest: 'tmp/ncbjs/ncb.js'
      },
    },
    uglify: {
      vendorjs: {
        files: {
          'build/static/assets/js/vendor.js': 'tmp/vendorjs/vendor.js'
        }
      },
      ncbjs: {
        files: {
        'build/static/assets/js/ncb.js': 'tmp/ncbjs/ncb.js'
        }
      }
    },
    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      minify: {
        flatten: true,
        expand: true,
        src: 'tmp/css/styles.css',
        dest: 'build/static/assets/css'
      }
    },
    htmllint: {
    	options: {
    		ignore: ['Attribute “buttons” not allowed on XHTML element “td” at this point.', 
    		'Table column 2 established by element “td” has no cells beginning in it.', 
    		'XHTML element “div” not allowed as child of XHTML element “ul” in this context. (Suppressing further errors from this subtree.)', 
    		'The element “button” must not appear as a descendant of the “a” element.', 
    		'XHTML element “li” not allowed as child of XHTML element “div” in this context. (Suppressing further errors from this subtree.)',
    		'The “for” attribute of the “label” element must refer to a form control.']
    	},
      all: ['tmp/index.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-bake');
  grunt.loadNpmTasks('grunt-html');

  grunt.registerTask('build:dist', [
    'clean',
    'jshint',
    'mochaTest',
    'bake:build',
    'htmllint',
    'less',
    'bowercopy',
    'concat',
    'cssmin',
    'copy:dist',
    'uglify',
    'htmlmin:build'
  ]);

grunt.registerTask('build:debug', [
    'clean',
    'jshint',
    'mochaTest',
    'bake:build',
    'htmllint',
    'less',
    'bowercopy',
    'concat',
    'copy:debug'
  ]);

  grunt.registerTask('lint', [
    'jshint',
    'bake:build',
    'htmllint',
    'less'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'bake:build',
    'htmllint',
    'less',
    'mochaTest'
  ]);
};
