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

				a.addNavNode({ title: 'Foo', name: 'foo' });
				a.addNavNode({ title: 'Bar', name: 'bar' });
				a.addNavNode({ title: 'Baz', name: 'baz', parent: 'bar' });
				a.addNavNode({ title: 'Bat', name: 'bat', parent: 'bar' });
				a.addNavNode({ title: 'Qux', name: 'qux' });
				a.addNavNode({ title: 'Quux', name: 'quux', parent: 'qux' });
				a.addNavNode({ title: 'Quuux', name: 'quuux', parent: 'qux' });

				expect(Object.keys(a.navNodes).length).to.be(7);

				expect(a.navNodes.foo.title).to.be('Foo');
				expect(a.navNodes.bar.title).to.be('Bar');
				expect(a.navNodes.baz.title).to.be('Baz');
				expect(a.navNodes.bat.title).to.be('Bat');
				expect(a.navNodes.qux.title).to.be('Qux');
				expect(a.navNodes.quux.title).to.be('Quux');
				expect(a.navNodes.quuux.title).to.be('Quuux');
			});

			it('should add a node to the nav tree', function () {
				var a = trabea();

				a.addNavNode({ title: 'Foo', name: 'foo' });
				a.addNavNode({ title: 'Bar', name: 'bar' });
				a.addNavNode({ title: 'Baz', name: 'baz', parent: 'bar' });
				a.addNavNode({ title: 'Bat', name: 'bat', parent: 'bar' });
				a.addNavNode({ title: 'Qux', name: 'qux' });
				a.addNavNode({ title: 'Quux', name: 'quux', parent: 'qux' });
				a.addNavNode({ title: 'Quuux', name: 'quuux', parent: 'qux' });

				expect(a.navTree.length).to.be(3);

				expect(a.navTree[0].title).to.be('Foo');
				expect(a.navTree[0].children.length).to.be(0);

				expect(a.navTree[1].title).to.be('Bar');
				expect(a.navTree[1].children.length).to.be(2);
				expect(a.navTree[1].children[0].title).to.be('Baz');
				expect(a.navTree[1].children[1].title).to.be('Bat');

				expect(a.navTree[2].title).to.be('Qux');
				expect(a.navTree[2].children.length).to.be(2);
				expect(a.navTree[2].children[0].title).to.be('Quux');
				expect(a.navTree[2].children[1].title).to.be('Quuux');
			});

			it('should not add unnamed nodes', function () {
				var a = trabea();

				a.addNavNode({ title: 'Foo' });

				expect(a.navTree.length).to.be(0);
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

				a.navNodes.foo = foo;
				a.navNodes.bar = bar;

				expect(a.getNavNode('foo')).to.eql(foo);
				expect(a.getNavNode('bar')).to.eql(bar);
			});
		});
	});
});
