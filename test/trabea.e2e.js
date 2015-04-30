/*eslint-env mocha */

import Trabea from '../index';
import expect from 'expect';
import streamArray from 'stream-array';
import vinylFs from 'vinyl-fs';
import { join } from 'path';
// import { readFileSync } from 'fs';

var config = {
	fixtures: join(__dirname, '/fixtures/**/*.{css,js}'),
	expected: join(__dirname, '/expected'),
	actual: join(__dirname, '/actual')
};

describe('trabea e2e', function () {
	// function toEqualExpected(file) {
	// 	var expected = file.path.replace('fixtures', 'expected');
	//
	// 	expect(String(file.contents)).toEqual(String(readFileSync(expected)));
	// }

	function toEqualUndefined(file) {
		expect(file.ast).toBe(undefined);
	}

	it('should parse files with an ast', function (done) {
		var css = require('toga-css'),
			js = require('toga-js'),
			markdown = require('toga-markdown'),
			sample = require('toga-sample');

		vinylFs
			.src(config.fixtures)
			.pipe(css.parser())
			.pipe(js.parser())
			.pipe(markdown.formatter())
			.pipe(sample.formatter())
			.pipe(new Trabea())
			.pipe(vinylFs.dest(config.actual))
			// .on('data', toEqualExpected)
			.on('error', done)
			.on('end', done);
	});

	it('should not parse empty files', function (done) {
		var mockFiles = [
			{ path: 'foo.js' },
			{ path: 'foo.js', content: null },
			undefined
		];

		streamArray(mockFiles)
			.pipe(new Trabea())
			.on('data', toEqualUndefined)
			.on('error', done)
			.on('end', done);
	});
});
