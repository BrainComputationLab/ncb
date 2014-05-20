module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['node_modules/', 'bower_components/', 'dist/', 'tmp'],
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['images/**', 'icons/**'],
                        dest: 'dist/static/assets/'
                    },
                    {
                        expand: true,
                        src: ['icons/**'],
                        dest: 'dist/static/assets/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['bower_components/bootstrap/dist/css/bootstrap.min.css'],
                        dest: 'dist/static/assets/css/vendor'
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
        requirejs: {
            compile: {
                options: {
                    baseUrl: '',
                    mainConfigFile: 'js/config.js',
                    name: 'bower_components/almond/almond',
                    out: 'dist/static/assets/js/ncb/ncb.min.js'
                }
            }
        },
        less: {
            production: {
                options: {
                    cleancss: true
                },
                files: {
                    "dist/static/assets/css/ncb/ncb.min.css": "less/main.less"
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

    grunt.registerTask('default', ['jshint', 'mochaTest', 'includes', 'copy',
                       'less', 'requirejs', 'htmlmin']);

    grunt.registerTask('clear', ['clean']);

};
