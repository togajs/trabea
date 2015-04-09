'use strict';

var trabea = require('../index'),
	expect = require('expect.js');

describe('Trabea', function () {
	it('should create an instance', function () {
		var Trabea = trabea,
			a = new Trabea(),
			b = trabea();

		expect(a).to.be.a(Trabea);
		expect(b).to.be.a(Trabea);

		expect(a).not.to.be(b);
	});

	describe('prototype', function () {
		describe('registerFile', function () {
			it('should register a subset of data as a file node', function () {
				var a = trabea();

				a.registerFile();
				a.registerFile({});
				a.registerFile({ base: 'foo', path: 'foo/Foo', ast: { nav: { title: 'Foo' } } });
				a.registerFile({ base: 'foo', path: 'foo/Bar', ast: { nav: { title: 'Bar' } } });
				a.registerFile({ base: 'foo', path: 'foo/Baz', ast: { nav: { title: 'Baz' } } });
				a.registerFile({ base: 'foo', path: 'foo/Bat', ast: { nav: { title: 'Bat' } } });
				a.registerFile({ base: 'foo', path: 'foo/Qux', ast: { nav: { title: 'Qux' } } });
				a.registerFile({ base: 'foo', path: 'foo/Quux', ast: { nav: { title: 'Quux' } } });
				a.registerFile({ base: 'foo', path: 'foo/Quuux', ast: { nav: { title: 'Quuux' } } });

				expect(a.fileNodes.length).to.be(8);

				a.fileNodes.forEach(function (node) {
					expect(node).to.only.have.keys([
						'name',
						'parent',
						'path',
						'title'
					]);
				});
			});
		});
	});
});
