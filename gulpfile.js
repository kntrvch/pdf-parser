'use strict';

var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    plugins = require('gulp-load-plugins')();

gulp.task('dev', function () {
  return plugins.nodemon({
    watch: ['config','controllers', 'models', 'util', 'routes','views', 'server.js'],
    script: 'server.js'
  });
});

gulp.task('default', ['dev']);