'use strict';

var Trabea = require('../index'),
	es = require('event-stream'),
	expect = require('expect.js'),
	vs = require('vinyl-fs');

describe('Trabea', function () {
	var compiler = Trabea;

	it('should create an instance', function () {
		var a = compiler(),
			b = new Trabea();

		expect(a).to.be.a(Trabea);
		expect(b).to.be.a(Trabea);

		expect(a).not.to.be(b);
	});

	describe('prototype', function () {
		describe('_transform', function () {
			var toAst = function (file, cb) {
				file.toga = {
					ast: JSON.parse(file.contents.toString())
				};

				cb(null, file);
			};

			it('should convert AST to HTML', function (done) {
				vs.src(__dirname + '/fixtures/**/*.*')
					.pipe(es.map(toAst))
					.pipe(compiler())
					.pipe(vs.dest(__dirname + '/actual'))
					.on('end', done);
			});
		});
	});
});
