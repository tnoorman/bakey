'use strict';
// Load plugins
const gulp = require('gulp'),
      autoprefixer = require('autoprefixer'),
      browsersync = require('browser-sync').create(),
      del = require('del'),
      eslint = require('gulp-eslint'),
      imagemin = require('gulp-imagemin'),
      jade = require('gulp-jade'),
      newer = require('gulp-newer'),
      plumber = require('gulp-plumber'),
      postcss = require('gulp-postcss'),
      rename = require('gulp-rename'),
      sass = require('gulp-sass'),
      webpack = require('webpack'),
      webpackconfig = require('./webpackconfig.js'),
      webpackstream = require('webpack-stream');

// BrowserSync
function serve(done) {
    browsersync.init({
        server: { baseDir: './' },
        port: 3000,
        injectChanges: true
    });
    done();
}

// BrowserSync Reload
function reload(done) {
    browsersync.reload();
    done();
}

// Clean assets
async function clean () {
    return await del(['./src/']);
}

// Optimize Images
function images() {
    return gulp
        .src('./src/img/*')
        .pipe(newer('./src/img'))
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 10 }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false,
                    collapseGroups: true
                }]
            })
        ]))
        .pipe(gulp.dest('./dist/img'));
}

// Compile jade files

function compileJade() {
    return gulp
        .src('./src/templates/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest('./'));
}

// CSS task
function css() {
    return gulp
        .src('./src/scss/**/*.scss')
        .pipe(plumber())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(gulp.dest('./assets/css/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('./assets/css/'))
        .pipe(browsersync.stream());
}

// Lint scripts
function scriptsLint() {
    return gulp
        .src(['./src/js/**/*', './gulpfile.js'])
        .pipe(plumber())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

// Transpile, concatenate and minify scripts
function scripts() {
    return gulp
        .src(['./src/js/**/*'])
        .pipe(plumber())
        .pipe(webpackstream(webpackconfig, webpack))
        // folder only, filename is specified in webpack config
        .pipe(gulp.dest('./assets/js/'))
        .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
    gulp.watch('./src/scss/**/*', css);
    gulp.watch('./src/js/**/*', gulp.series(scriptsLint, scripts));
    gulp.watch('./src/templates/**/*.jade', gulp.parallel(compileJade, reload));
    gulp.watch([
        './src/templates/*.jade',
        './src/scss/**/*.scss'
    ], 
    gulp.watch('./src/img/**/*', images));
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(clean, gulp.parallel(css, images, js));
const watch = gulp.parallel(watchFiles, reload);
const dev = gulp.series(serve, watch)

// export tasks
module.exports = {
    images,
    css,
    js,
    clean,
    build,
    watch,
    compileJade,
    dev,
    default: build
};