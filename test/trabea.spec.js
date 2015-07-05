/*eslint-env mocha */

var Trabea = require('../src/trabea'),
	expect = require('expect');

describe('Trabea', function () {
	it('should create an instance', function () {
		var a = new Trabea();

		expect(a).toBeA(Trabea);
	});

	describe('#initHandlebars', function () {
		it('should register a subset of data as a file node', function () {
		});
	});

	describe('#initLunr', function () {
		it('should register a subset of data as a file node', function () {
		});
	});

	describe('#initTemplateData', function () {
		it('should register a subset of data as a file node', function () {
		});
	});

	describe('#registerFile', function () {
		it('should register a subset of data as a file node', function () {
			var a = new Trabea();

			a.registerFileData();
			a.registerFileData({});
			a.registerFileData({ base: 'foo', path: 'foo/Foo', ast: { nav: { title: 'Foo' } } });
			a.registerFileData({ base: 'foo', path: 'foo/Bar', ast: { nav: { title: 'Bar' } } });
			a.registerFileData({ base: 'foo', path: 'foo/Baz', ast: { nav: { title: 'Baz' } } });
			a.registerFileData({ base: 'foo', path: 'foo/Bat', ast: { nav: { title: 'Bat' } } });
			a.registerFileData({ base: 'foo', path: 'foo/Qux', ast: { nav: { title: 'Qux' } } });
			a.registerFileData({ base: 'foo', path: 'foo/Quux', ast: { nav: { title: 'Quux' } } });
			a.registerFileData({ base: 'foo', path: 'foo/Quuux', ast: { nav: { title: 'Quuux' } } });

			expect(a.fileNodes.length).toBe(8);

			a.fileNodes.forEach(function (node) {
				expect(Object.keys(node)).toEqual([
					'name',
					'parent',
					'path',
					'title'
				]);
			});
		});
	});
});
