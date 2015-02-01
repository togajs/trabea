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
		describe('addNavNode', function () {
			it('should add a node to the node index', function () {
				var a = trabea();

				a.addNavNode({ ast: { nav: { title: 'Foo', name: 'foo' } } });
				a.addNavNode({ ast: { nav: { title: 'Bar', name: 'bar' } } });
				a.addNavNode({ ast: { nav: { title: 'Baz', name: 'baz', parent: 'bar' } } });
				a.addNavNode({ ast: { nav: { title: 'Bat', name: 'bat', parent: 'bar' } } });
				a.addNavNode({ ast: { nav: { title: 'Qux', name: 'qux' } } });
				a.addNavNode({ ast: { nav: { title: 'Quux', name: 'quux', parent: 'qux' } } });
				a.addNavNode({ ast: { nav: { title: 'Quuux', name: 'quuux', parent: 'qux' } } });

				expect(Object.keys(a.navIndex).length).to.be(7);

				expect(a.navIndex.foo.title).to.be('Foo');
				expect(a.navIndex.bar.title).to.be('Bar');
				expect(a.navIndex.baz.title).to.be('Baz');
				expect(a.navIndex.bat.title).to.be('Bat');
				expect(a.navIndex.qux.title).to.be('Qux');
				expect(a.navIndex.quux.title).to.be('Quux');
				expect(a.navIndex.quuux.title).to.be('Quuux');
			});

			it('should add a node to the nav nodes list', function () {
				var a = trabea();

				a.addNavNode({ ast: { nav: { title: 'Foo', name: 'foo' } } });
				a.addNavNode({ ast: { nav: { title: 'Bar', name: 'bar' } } });
				a.addNavNode({ ast: { nav: { title: 'Baz', name: 'baz', parent: 'bar' } } });
				a.addNavNode({ ast: { nav: { title: 'Bat', name: 'bat', parent: 'bar' } } });
				a.addNavNode({ ast: { nav: { title: 'Qux', name: 'qux' } } });
				a.addNavNode({ ast: { nav: { title: 'Quux', name: 'quux', parent: 'qux' } } });
				a.addNavNode({ ast: { nav: { title: 'Quuux', name: 'quuux', parent: 'qux' } } });

				expect(a.navNodes.length).to.be(3);

				expect(a.navNodes[0].title).to.be('Foo');
				expect(a.navNodes[0].children.length).to.be(0);

				expect(a.navNodes[1].title).to.be('Bar');
				expect(a.navNodes[1].children.length).to.be(2);
				expect(a.navNodes[1].children[0].title).to.be('Baz');
				expect(a.navNodes[1].children[1].title).to.be('Bat');

				expect(a.navNodes[2].title).to.be('Qux');
				expect(a.navNodes[2].children.length).to.be(2);
				expect(a.navNodes[2].children[0].title).to.be('Quux');
				expect(a.navNodes[2].children[1].title).to.be('Quuux');
			});

			it('should not add unnamed nodes', function () {
				var a = trabea();

				a.addNavNode({ title: 'Foo' });

				expect(a.navNodes.length).to.be(0);
			});
		});

		describe('getNavNode', function () {
			it('should return a new node', function () {
				var a = trabea(),
					foo = a.getNavNode('foo'),
					bar = a.getNavNode('bar');

				expect(foo).to.eql({ children: [] });
				expect(bar).to.eql({ children: [] });

				expect(foo).not.to.be(bar);
			});

			it('should return an existing node', function () {
				var a = trabea(),
					foo = {
						title: 'Foo',
						name: 'foo',
						children: []
					},
					bar = {
						title: 'Bar',
						name: 'bar',
						children: []
					};

				a.navIndex.foo = foo;
				a.navIndex.bar = bar;

				expect(a.getNavNode('foo')).to.eql(foo);
				expect(a.getNavNode('bar')).to.eql(bar);
			});
		});

		describe('addSearchNode', function () {
			it('should add a node to the search nodes list', function () {
				var a = trabea();

				a.addSearchNode({ ast: { nav: { title: 'Foo', name: 'foo' } } });
				a.addSearchNode({ ast: { nav: { title: 'Bar', name: 'bar' } } });
				a.addSearchNode({ ast: { nav: { title: 'Baz', name: 'baz', parent: 'bar' } } });
				a.addSearchNode({ ast: { nav: { title: 'Bat', name: 'bat', parent: 'bar' } } });
				a.addSearchNode({ ast: { nav: { title: 'Qux', name: 'qux' } } });
				a.addSearchNode({ ast: { nav: { title: 'Quux', name: 'quux', parent: 'qux' } } });
				a.addSearchNode({ ast: { nav: { title: 'Quuux', name: 'quuux', parent: 'qux' } } });

				expect(a.searchNodes.length).to.be(7);

				// expect(a.searchNodes[0].title).to.be('Foo');
				// expect(a.searchNodes[1].title).to.be('Bar');
				// expect(a.searchNodes[2].title).to.be('Qux');
				// expect(a.searchNodes[3].title).to.be('Quux');
				// expect(a.searchNodes[4].title).to.be('Quuux');
				// expect(a.searchNodes[5].title).to.be('Quuuux');
				// expect(a.searchNodes[6].title).to.be('Quuuuux');
			});
		});
	});
});
