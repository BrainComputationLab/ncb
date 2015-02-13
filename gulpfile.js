var gulp = require('gulp');
var less = require('gulp-less');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var fileinclude = require('gulp-file-include');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var minifyHTML = require('gulp-minify-html');
var streamqueue = require('streamqueue');
var shell = require('gulp-shell');
var sourcemaps = require('gulp-sourcemaps');

var buildPath = 'build/';
var assetPath = buildPath + 'static/assets/';

var paths = {
    allJs: 'js/**.js',
    less: 'less/main.less',
    allLess: 'less/*.less',
    cssDest: assetPath + '/css/styles.css',
    cssDeps: [
        'node_modules/angular-motion/dist/angular-motion.css',
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'bower_components/bootstrap-additions/dist/bootstrap-additions.css',
        'bower_components/angular-snap/angular-snap.css',
        'bower_components/angular-bootstrap-colorpicker/css/colorpicker.css',
        'bower_components/angular-xeditable/dist/css/xeditable.css'
    ],
    vendorJs: [
        './node_modules/jquery/dist/jquery.js',
        './node_modules/bootstrap/dist/js/bootstrap.js',
        './node_modules/underscore/underscore.js',
        './node_modules/angular/angular.js',
        './node_modules/angular-strap/dist/angular-strap.js',
        './node_modules/angular-strap/dist/angular-strap.tpl.js',
        './node_modules/restangular/dist/restangular.js',
        './node_modules/gulp-jshint/node_modules/jshint/node_modules/underscore/underscore.js',
        './bower_components/snapjs/snap.js',
        './bower_components/angular-snap/angular-snap.js',
        './bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
        './bower_components/angular-xeditable/dist/js/xeditable.js',
        './bower_components/jquery-ui/jquery-ui.js'
    ],
    ncbjsSrc: [
        'js/init.js',
        'js/json.js',
        'js/utilityFcns.js',
        'js/parameters.js',
        'js/app.js',
        'js/model.services.js',
        'js/builder.controllers.js',
        'js/sim.controllers.js'
    ],
    ncbjsDest: assetPath + 'js/ncb.js',
    buildMotion: 'js/vbot/build_motion.py',
    motionDest: 'js/vbot/motion.js',
    vbotEntry: 'js/vbot/main.js',
    indexHtml: 'html/index.html',
    allHtml: 'html/**.html',
    indexDest: buildPath,
    colorPickerHtml: 'html/global/colorpicker-popover.html',
    fonts: 'node_modules/bootstrap/dist/fonts/*',
    tests: 'js/test/*.js',
    serverPy: ['ncb/server.py', 'ncb/db.py', 'ncb/__init__.py'],
    otherAssets: ['images/**', 'icons/**']
};

gulp.task('css', function () {
    var vendor = gulp.src(paths.cssDeps);
    var ncStyles = gulp.src(paths.less)
                       .pipe(less());

    return streamqueue({ objectMode: true }, vendor, ncStyles)
        .pipe(concat(paths.cssDest))
        .pipe(minifyCSS())
        .pipe(gulp.dest('.'));
});

gulp.task('vendorJs', function () {
    return gulp.src(paths.vendorJs)
        .pipe(sourcemaps.init())
        .pipe(concat(assetPath + 'js/vendor.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('.'));
});

gulp.task('ncbjs', ['lint'], function () {
    return gulp.src(paths.ncbjsSrc)
        .pipe(sourcemaps.init())
        .pipe(concat(paths.ncbjsDest))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('.'));
});

gulp.task('html', function () {
    return gulp.src(paths.indexHtml)
        .pipe(fileinclude())
        .pipe(minifyHTML())
        .pipe(gulp.dest(paths.indexDest));
});

gulp.task('test', function () {
    return gulp.src(paths.tests, {read: false})
        .pipe(mocha());
});

gulp.task('copyPython', function () {
    return gulp.src(paths.serverPy)
        .pipe(gulp.dest(buildPath));
});

gulp.task('copyAssets', function () {
    return gulp.src(paths.otherAssets, { base : '.' })
        .pipe(gulp.dest(assetPath));
});

gulp.task('copyPopover', function () {
    return gulp.src(paths.colorPickerHtml)
        .pipe(gulp.dest(assetPath + 'html/'));
});

gulp.task('copyFonts', function () {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest(assetPath + 'fonts/'));
});

gulp.task('copy',
   ['copyPython',
    'copyAssets',
    'copyPopover',
    'copyFonts']);

gulp.task('lint', function () {
    return gulp.src(paths.allJs)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('build', ['ncbjs', 'html', 'css', 'copy', 'vendorJs']);

gulp.task('watch', function () {
    watch(paths.ncbjsSrc, batch(function () {
        gulp.start('ncbjs');
    }));
    watch(paths.allHtml, batch(function () {
        gulp.start('html');
    }));
    watch(paths.allLess, batch(function () {
        gulp.start('css');
    }));
    watch(paths.serverPy, batch(function () {
        gulp.start('copyPython')
    }));
    watch(paths.otherAssets, batch(function () {
        gulp.start('copyAssets');
    }));
    watch(paths.colorPickerHtml, batch(function () {
        gulp.start('copyPopover');
    }));
});

gulp.task('default', ['build'],
    shell.task(['cd build && python server.py']));

