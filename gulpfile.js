'use strict';
// Load plugins
const gulp = require('gulp'),
      autoprefixer = require('autoprefixer'),
      browsersync = require('browser-sync').create(),
      babel = require('gulp-babel'),
      del = require('del'),
      eslint = require('gulp-eslint'),
      imagemin = require('gulp-imagemin'),
      jade = require('gulp-jade'),
      newer = require('gulp-newer'),
      plumber = require('gulp-plumber'),
      postcss = require('gulp-postcss'),
      rename = require('gulp-rename'),
      sass = require('gulp-sass'),
      cleanCSS = require('gulp-clean-css');

// BrowserSync
function serve(done) {
    browsersync.init({
        server: { baseDir: './public' },
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
        .pipe(gulp.dest('./public'));
}

// CSS task
function css() {
    return gulp
        .src('./src/scss/main.scss')
        .pipe(plumber())
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('./public/dist/css/'))
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
        .src('./src/scripts/main.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(plumber())
        // folder only, filename is specified in webpack config
        .pipe(gulp.dest('./public/dist/js/'))
}

// Watch files
function watchFiles() {
    gulp.watch('./src/scripts/**/*.js', gulp.parallel(scripts, reload));
    gulp.watch('./src/scss/**/*.scss', gulp.parallel(css, reload));
    gulp.watch('./src/templates/**/*.jade', gulp.parallel(compileJade, reload));
    gulp.watch('./src/img/**/*', images);
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(clean, gulp.parallel(css, images, js));
const watch = gulp.parallel(watchFiles, reload);
const dev = gulp.series(serve, watch, scripts)

// export tasks
module.exports = {
    images,
    css,
    js,
    clean,
    build,
    watch,
    compileJade,
    scripts,
    dev,
    default: build
};