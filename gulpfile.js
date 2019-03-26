'use strict';

// Load plugins
const autoprefixer = require('autoprefixer');
const browsersync = require('browser-sync').create();
const cp = require('child_process');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const webpack = require('webpack');
const webpackconfig = require('./webpackconfig.js');
const webpackstream = require('webpack-stream');

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: { baseDir: './_site/' },
        port: 3000
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Clean assets
async function clean () {
    return await del(['./app/src/']);
}

// Optimize Images
function images() {
    return gulp
        .src('./src/img/*')
        .pipe(newer('./app/img'))
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
        .pipe(gulp.dest('./app/src/img'));
}

// CSS task
function css() {
    return gulp
        .src('./src/scss/**/*.scss')
        .pipe(plumber())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(gulp.dest('./_site/assets/css/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('./_site/assets/css/'))
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
        .pipe(gulp.dest('./_site/assets/js/'))
        .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
    gulp.watch('./src/scss/**/*', css);
    gulp.watch('./src/js/**/*', gulp.series(scriptsLint, scripts));
    gulp.watch([
        './_includes/**/*',
        './_layouts/**/*',
        './_pages/**/*',
        './_posts/**/*',
        './_projects/**/*'
    ], gulp.series(browserSyncReload));
    gulp.watch('./src/img/**/*', images);
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(clean, gulp.parallel(css, images, js));
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
module.exports = {
    images,
    css,
    js,
    clean,
    build,
    watch,
    default: build
};