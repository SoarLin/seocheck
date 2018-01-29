'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rimraf = require('rimraf');

gulp.task('scripts', function() {
  return gulp.src('lib/**/*.js')
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(concat('seo.checker.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(uglify())
    .pipe(concat('seo.checker.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('clean', function(cb) {
  return rimraf('dist', cb);
});

gulp.task('default', ['clean'], function() {
  gulp.start('scripts');
});