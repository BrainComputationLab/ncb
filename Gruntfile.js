module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/', 'tmp/'],
        bowercopy: {
            almond: {
                files: {
                    'dist/assets/js/vendor/almond.js': 'almond/almond.js'
                }
            },
            'angular-strap': {
                files: {
                    'dist/assets/js/vendor/angular-strap.min.js': 'angular-strap/dist/angular-strap.min.js',
                    'dist/assets/js/vendor/angular-strap.tpl.min.js': 'angular-strap/dist/angular-strap.tpl.min.js',
                    'dist/assets/js/vendor/angular-strap.min.js.map': 'angular-strap/dist/angular-strap.min.js.map',
                    'dist/assets/js/vendor/angular-strap.tpl.min.js.map': 'angular-strap/dist/angular-strap.tpl.min.js.map'
                }
            },
            'angular-ui-bootstrap-bower': {
                files: {
                    'dist/assets/js/vendor/ui-bootstrap.min.js': 'angular-ui-bootstrap-bower/ui-bootstrap.min.js'
                }
            },
            angular: {
                files: {
                    'dist/assets/js/vendor/angular.min.js.map': 'angular/angular.min.js.map',
                    'dist/assets/js/vendor/angular.min.js': 'angular/angular.js'
                }
            },
            'angular-animate': {
                files: {
                    'dist/assets/js/vendor/angular-animate.min.js': 'angular-animate/angular-animate.min.js'
                }
            },
            'angular-motion': {
                files: {
                    'dist/assets/css/angular-motion.min.css': 'angular-motion/dist/angular-motion.min.css'
                }
            },
            restangular: {
                files: {
                    'dist/assets/js/vendor/restangular.min.js': 'restangular/dist/restangular.min.js'
                }
            },
            bootstrap: {
                files: {
                    'dist/assets/css/bootstrap.min.css': 'bootstrap/dist/css/bootstrap.min.css',
                    'dist/assets/js/vendor/bootstrap.min.js': 'bootstrap/dist/js/bootstrap.min.js',
                    'dist/assets/fonts/': 'bootstrap/dist/fonts/*'
                }
            },
            'bootstrap-additions': {
                files: {
                    'dist/assets/css/bootstrap-additions.min.css': 'bootstrap-additions/dist/bootstrap-additions.min.css'
                }
            },
            jquery: {
                files: {
                    'dist/assets/js/vendor/jquery.min.js': 'jquery/dist/jquery.js',
                    'dist/assets/js/vendor/jquery.min.map': 'jquery/dist/jquery.min.map'
                }
            },
            underscore: {
                files: {
                    'dist/assets/js/vendor/underscore.js': 'underscore/underscore.js'
                }
            },
            requirejs: {
                files: {
                    'dist/assets/js/vendor/require.js': 'requirejs/require.js'
                }
            },
            jssha: {
                files: {
                    'dist/assets/js/vendor/sha256.js': 'jssha/src/sha256.js'
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['images/**', 'icons/**'],
                        dest: 'dist/assets/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['js/*.js'],
                        dest: 'dist/assets/js/ncb'
                    }
                ]
            }
        },
        includes: {
            files: {
                src: ['html/index.html'],
                dest: 'tmp',
                flatten: true,
                includePath: 'html'
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'tmp/index.html'
                }
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'js/*.js']
        },
        less: {
            production: {
                options: {
                    cleancss: true
                },
                files: {
                    "dist/assets/css/ncb.min.css": "less/main.less"
                }
            }
        },
        mochaTest: {
            test: {
                src: ['js/tests/*.js']
            }
        },
    });

    grunt.loadNpmTasks('grunt-includes');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-bowercopy');

    grunt.registerTask('default', ['jshint', 'mochaTest', 'clean', 'includes',
                       'copy', 'bowercopy', 'less', 'htmlmin']);
};
