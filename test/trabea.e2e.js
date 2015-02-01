'use strict';

var trabea = require('../index'),
	es = require('event-stream'),
	fs = require('fs'),
	expect = require('expect.js'),
	toga = require('toga'),

	config = {
		src:  __dirname + '/fixtures/**/*.{css,js}',
		dest: __dirname + '/actual',
		debug: true
	};

describe('trabea e2e', function () {
	var count;

	function toEqualExpected(file, cb) {
		count++;

		var expected = file.path.replace('fixtures', 'expected');
		expect(file.contents.toString()).to.be(fs.readFileSync(expected, 'utf8'));
		cb(null, file);
	}

	function toEqualUndefined(file, cb) {
		count++;

		expect(file.ast).to.be(undefined);
		cb(null, file);
	}

	beforeEach(function () {
		count = 0;
	});

	it('should parse files with an ast', function (done) {
		var css = require('toga-css'),
			js = require('toga-js'),
			md = require('toga-markdown'),
			when = require('gulp-if');

		toga
			.src(config.src)
			.pipe(css.parser())
			.pipe(js.parser())
			// TODO .pipe(md.parser())
			.pipe(md.formatter())
			.pipe(trabea())
			.pipe(when(!config.debug, es.map(toEqualExpected)))
			.pipe(when(config.debug, toga.dest(config.dest)))
			.on('error', done)
			.on('end', function () {
				expect(count).to.be(0);
				done();
			});
	});

	it('should not parse empty files', function (done) {
		var files = [
			{ path: 'foo.js' },
			{ path: 'foo.js', content: null },
			undefined
		];

		es
			.readArray(files)
			.pipe(trabea())
			.pipe(es.map(toEqualUndefined))
			.on('error', done)
			.on('end', function () {
				// expect(count).to.be(0);
				done();
			});
	});
});
