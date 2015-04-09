'use strict';

var gulp = require('gulp'),
	paths = {
		gulp: 'gulpfile.js',
		src: 'index.js',
		test: 'test/**/*.{e2e,spec}.js'
	};

gulp.task('default', ['test']);

gulp.task('lint', function () {
	var jscs = require('gulp-jscs'),
		jshint = require('gulp-jshint');

	return gulp
		.src([paths.gulp, paths.src, paths.test])
		.pipe(jscs())
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.on('error', console.error.bind(console));
});

gulp.task('copy', function () {
	// Trabea is its own fixture.
	return gulp
		.src(paths.src)
		.pipe(gulp.dest('test/fixtures'))
		.on('error', console.error.bind(console));
});

gulp.task('cover', function () {
	var istanbul = require('gulp-istanbul');

	return gulp
		.src(paths.src)
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('error', console.error.bind(console));
});

gulp.task('test', ['lint', 'copy', 'cover'], function () {
	var istanbul = require('gulp-istanbul'),
		mocha = require('gulp-mocha');

	return gulp
		.src(paths.test)
		.pipe(mocha({ reporter: 'spec' }))
		.pipe(istanbul.writeReports())
		.on('error', console.error.bind(console));
});

gulp.task('watch', function () {
	gulp.watch(['./index.js', './test/*.js', './theme/**'], ['test']);
});
