/* eslint-env mocha */

var Trabea = require('../src/trabea'),
	Trifle = require('trifle'),
	Tunic = require('tunic'),
	expect = require('expect'),
	// rimraf = require('rimraf'),
	streamArray = require('stream-array'),
	toga = require('toga'),
	join = require('path').join,
	// readFileSync = require('fs').readFileSync,

	config = {
		fixtures: join(__dirname, '/fixtures/**/*.{css,js}'),
		expected: join(__dirname, '/expected'),
		actual: join(__dirname, '/actual')
	};

describe('trabea e2e', function () {
	// function expectFile(file) {
	// 	var expected = file.path.replace('fixtures', 'expected');
	//
	// 	expect(String(file.contents)).toEqual(String(readFileSync(expected)));
	// }

	function expectUndefined(file) {
		expect(file.ast).toBe(undefined);
	}

	// beforeEach(function (done) {
	// 	rimraf(config.actual, done);
	// });

	it('should parse files with an ast', function (done) {
		toga
			.src(config.fixtures)
			.pipe(new Tunic())
			.pipe(new Trifle())
			.pipe(new Trabea())
			// .on('data', expectFile)
			.pipe(toga.dest(config.actual))
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
			.on('data', expectUndefined)
			.on('error', done)
			.on('end', done);
	});
});
