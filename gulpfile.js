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
var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
var path = require('path');
var plumber = require('gulp-plumber');
var named = require('vinyl-named');

var buildPath = 'build/';
var assetPath = buildPath + 'static/assets/';

var paths = {
    allJs: 'js/**/*.js',
    less: 'less/main.less',
    allLess: 'less/**/*.less',
    cssDest: assetPath + '/css/styles.css',
    cssDeps: [
        'node_modules/angular-motion/dist/angular-motion.css',
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'bower_components/bootstrap-additions/dist/bootstrap-additions.css',
        'bower_components/angular-snap/angular-snap.css',
        'bower_components/angular-bootstrap-colorpicker/css/colorpicker.css',
        'bower_components/angular-xeditable/dist/css/xeditable.css'
    ],
    jsDest: assetPath + 'js/ncb.js',
    buildMotion: 'js/vbot/build_motion.py',
    motionDest: 'js/vbot/motion.js',
    vbotEntry: 'js/vbot/main.js',
    indexHtml: 'html/index.html',
    allHtml: 'html/**/*.html',
    indexDest: buildPath,
    colorPickerHtml: 'html/global/colorpicker-popover.html',
    fonts: 'node_modules/bootstrap/dist/fonts/*',
    tests: 'js/test/*.js',
    serverPy: ['ncb/server.py', 'ncb/db.py', 'ncb/__init__.py'],
    otherAssets: ['images/**/*', 'icons/**/*'],
    targets: {
        'ncb': './js/init.js',
    }
};

// This lets us modify the config easily
function webpackConf(options) {
    var defaultConf = {
        devtool: '#source-map',
        resolve: {
            root: [path.join(__dirname, "bower_components")]
        },
        plugins: [
            new webpack.ResolverPlugin(
                new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
            )
        ],
        entry: paths.targets,
        output: {
            filename: '[name].js'
        }
    };
    if (options !== undefined) {
        for (option in options) {
            if (options.hasOwnProperty(option)) {
                defaultConf[option] = options[option];
            }
        }
    }

    return defaultConf;
}

// Makes a task to build the JS with certain arguments to Webpack.
function buildJsTask(options) {
    return function () {
        return gulp.src('.')
            .pipe(gulpWebpack(webpackConf(options), webpack))
            .pipe(gulp.dest(assetPath + 'js/'));
    };
}

// Makes a watcher
function makeWatch(path, task) {
    watch(path, batch(function (events, cb) {
        events.on('data', function () {
            gulp.start(task);
        }).on('end', cb)
    }));
}

gulp.task('css', function () {
    var vendor = gulp.src(paths.cssDeps);
    var ncStyles = gulp.src(paths.less)
                       .pipe(plumber())
                       .pipe(less());

    return streamqueue({ objectMode: true }, vendor, ncStyles)
        .pipe(concat(paths.cssDest))
        .pipe(minifyCSS())
        .pipe(gulp.dest('.'));
});

gulp.task('js', ['lint'], buildJsTask());

gulp.task('jsWatch', ['lint'], buildJsTask({watch:true}));

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

gulp.task('build', ['js', 'html', 'css', 'copy']);

gulp.task('watch', ['build'], function () {
    buildJsTask({watch: true})();
    makeWatch(paths.allJs, 'lint');
    makeWatch(paths.allHtml, 'html');
    makeWatch(paths.allLess, 'css');
    makeWatch(paths.serverPy, 'copyPython');
    makeWatch(paths.otherAssets, 'copyAssets');
    makeWatch(paths.colorPickerHtml, 'copyPopover');
});

gulp.task('run', ['build'],
    shell.task(['cd build && python server.py']));

gulp.task('default', ['watch', 'run']);
