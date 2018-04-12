var gulp       = require('gulp');
var sass       = require('gulp-sass');
var clean      = require('gulp-clean');
var browserify = require('browserify');
var source     = require('vinyl-source-stream');
var csso       = require('gulp-csso');
var uglify     = require('gulp-uglify');
var buffer     = require('vinyl-buffer');

var paths = {
  scripts: {
    source: './app/Background/app.js',
    destination: './app/Background/',
    filename: 'bundle.js',
    watch: './app/Background/*.js'
  }
};

var paths2 = {
  scripts: {
    source: './app/Popup/app.js',
    destination: './app/Popup/',
    filename: 'bundle.js',
    watch: ['./app/**/*.js', '!./app/Background/*.js']
  }
};

gulp.task('browserify-bg', function () {
  var bundle = browserify({
    entries: [paths.scripts.source],
    debug: true
  });
  function createErrorHandler(name) {
    return function (err) {
      console.error('Error from ' + name + ' in compress task', err.toString());
    };
  }
  return bundle.bundle()
    .pipe(source(paths.scripts.filename))
    .pipe(buffer())
    .pipe(gulp.dest(paths.scripts.destination));
});

gulp.task('browserify-bg-prod', function () {
  var bundle = browserify({
    entries: [paths.scripts.source],
    debug: true
  });
  function createErrorHandler(name) {
    return function (err) {
      console.error('Error from ' + name + ' in compress task', err.toString());
    };
  }
  return bundle.bundle()
    .pipe(source(paths.scripts.filename))
    .pipe(buffer())
    .pipe(uglify({ mangle: false }))
    .pipe(gulp.dest(paths.scripts.destination));
});

gulp.task('browserify-popup', function () {
  var bundle = browserify({
    entries: [paths2.scripts.source],
    debug: true
  });
  return bundle.bundle()
    .pipe(source(paths2.scripts.filename))
    .pipe(buffer())
    .pipe(gulp.dest(paths2.scripts.destination));
});
gulp.task('browserify-popup-prod', function () {
  var bundle = browserify({
    entries: [paths2.scripts.source],
    debug: true
  });
  return bundle.bundle()
    .pipe(source(paths2.scripts.filename))
    .pipe(buffer())
    .pipe(uglify({ mangle: false }))
    .pipe(gulp.dest(paths2.scripts.destination));
});

gulp.task('watch-two', function() {
  gulp.watch(paths.scripts.watch, ['browserify-bg']);
  gulp.watch(paths2.scripts.watch, ['browserify-popup']);
});

gulp.task('scss', function () {
  return gulp.src('./app/assets/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(csso({
      restructure: false,
      sourceMap: true,
      debug: true
    }))
    .pipe(gulp.dest('./app/assets/styles/'));
});

gulp.task('scss-watcher',function(){
  gulp.watch('./app/assets/scss/_*.scss',['scss']);
});


//prod dist folder tasks
var paths3 = {
 manifest:['app/manifest.json'],
 app:['app/*/**'],
 dist: 'dist/'
};

gulp.task('clean-dist', function() {
 return gulp.src(paths3.dist)
 .pipe(clean());
});
gulp.task('create-dist', function(){
 gulp.src(paths3.app.concat(paths3.manifest))
 .pipe(gulp.dest(paths3.dist));
});

//run commands
gulp.task('watch', ['watch-two','scss-watcher']);
gulp.task('build', ['browserify-bg','browserify-popup', 'scss']);
gulp.task('build-prod', ['browserify-bg-prod','browserify-popup-prod', 'scss']);
