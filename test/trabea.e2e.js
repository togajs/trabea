/* eslint-env mocha */

import Trabea from '../src/trabea';
import Trifle from 'trifle';
import Tunic from 'tunic';
import expect from 'expect';
import toga from 'toga';
import { join } from 'path';
import { readFileSync } from 'fs';

var config = {
	fixtures: join(__dirname, '/fixtures/**/*.{css,js}'),
	expected: join(__dirname, '/expected'),
	actual: join(__dirname, '/actual')
};

describe('trabea e2e', function () {
	function expectFile(file) {
		var expected = file.path.replace('fixtures', 'expected'),
			actual = String(file.contents);

		expect(actual).toEqual(String(readFileSync(expected)));
		// file.contents = new Buffer(actual);
	}

	it('should parse files with an ast', function (done) {
		toga
			.src(config.fixtures)
			.pipe(new Tunic())
			.pipe(new Trifle())
			.pipe(new Trabea())
			.on('data', expectFile)
			// .pipe(toga.dest(config.actual))
			.on('error', done)
			.on('end', done);
	});
});
