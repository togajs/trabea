'use strict';

/**
 * # Trabea
 *
 * A theme engine for [Toga](http://togajs.github.io/) documentation.
 */

var proto,
	File = require('vinyl'),
	Transform = require('stream').Transform,
	handlebars = require('handlebars'),
	inherits = require('mtil/function/inherits'),
	lunr = require('lunr'),
	map = require('map-stream'),
	mixin = require('mtil/object/mixin'),
	path = require('path'),
	registrar = require('handlebars-registrar'),
	vinylFs = require('vinyl-fs'),

	// Default options
	defaults = {
		theme: path.resolve(process.cwd(), 'theme'),
		assets: './assets/**',
		data: './data/*.js{,on}',
		helpers: './helpers/*.js',
		partials: './partials/*.hbs',
		extension: '.html'
	};

/**
 * @class Tunic
 * @extends Transform
 *
 * @constructor
 * @param {Object} options
 */
function Trabea(options) {
	// Support functional execution.
	if (!(this instanceof Trabea)) {
		return new Trabea(options);
	}

	/**
	 * Theme options. Values are copied onto a new object so that the
	 * passed-in object isn't accidentally modified.
	 *
	 * @property options
	 * @type {Object}
	 */
	this.options = mixin({}, defaults, options);

	/**
	 * A lookup object of nav nodes to make it easy to add leaves to the tree.
	 *
	 * @property navIndex
	 * @type {Object}
	 */
	this.navIndex = {};

	/**
	 * The `navNodes` is written to a JSON data file after all other files have
	 * been consumed and generated.
	 *
	 * @property navNodes
	 * @type {Array}
	 */
	this.navNodes = [];

	/**
	 * A Lunr instance for generating a search index to be used client-side.
	 *
	 * @property searchIndex
	 * @type {Lunr}
	 */
	this.searchIndex = null;

	/**
	 * The `searchNodes` is written to a JSON data file after all other files
	 * have been consumed and generated.
	 *
	 * @property searchNodes
	 * @type {Array}
	 */
	this.searchNodes = [];

	Transform.call(this, {
		objectMode: true
	});

	this
		.initHandlebars()
		.initLunr();
}

proto = inherits(Trabea, Transform);

/**
 * @method initHandlebars
 * @chainable
 */
proto.initHandlebars = function () {
	var options = this.options;

	registrar(handlebars, {
		cwd: options.theme,
		helpers: options.helpers,
		partials: options.partials
	});

	return this;
};

/**
 * @method initLunr
 * @chainable
 */
proto.initLunr = function () {
	this.searchIndex = lunr(function () {
		this.field('path');
		this.field('title');
		this.ref('id');
	});

	return this;
};

/**
 * Updates the `navNodes` with a new `navNode` based on the `nav` object in a
 * file's AST for use on the client-side.
 *
 * @method addNavNode
 * @param {File} file
 * @chainable
 */
proto.addNavNode = function (file) {
	var navNode,
		ast = file && file.ast,
		nav = ast && ast.nav,
		name = nav && nav.name,
		parent = nav && nav.parent;

	// Nothing to do
	if (name == null) {
		return this;
	}

	// Get or create navNode
	navNode = this.getNavNode(name);

	// Copy AST properties to node
	mixin(navNode, nav);

	if (!parent) {
		// Add node to root of navNodes
		this.navNodes
			.push(navNode);
	}
	else {
		// Add node to parent node's list of children
		this.getNavNode(parent)
			.children
			.push(navNode);
	}

	return this;
};

/**
 * Gets or creates a `navNode` for use in the `navNodes` tree.
 *
 * @method getNavNode
 * @param {String} name
 * @return {Object}
 */
proto.getNavNode = function (name) {
	var navIndex = this.navIndex;

	return navIndex[name] || (navIndex[name] = {
		children: []
	});
};

/**
 * Updates the `searchNodes` with a new `searchNode` and adds it to the search
 * index for use on the client-side.
 *
 * @method addSearchNode
 * @param {File} file
 * @chainable
 */
proto.addSearchNode = function (file) {
	var node = {
		path: path.relative(file.base || '', file.path || '')
	};

	this.searchNodes.push(node);
	this.searchIndex.add(node);

	return this;
};

/**
 * Takes each file to be documented, processes it, renders the AST as html,
 * and sends it down the pipe to be written to disk.
 *
 * @method _transform
 * @param {String} file
 * @param {String} enc
 * @param {Function} cb
 */
proto._transform = function (file, enc, cb) {
	var options = this.options,
		ast = file && file.ast;

	// Nothing to do
	if (!ast) {
		return cb();
	}

	// Expose parent directory for resolving relative paths
	file.dirname = path.dirname(file.path);

	// Append desired extension
	file.path += options.extension;

	// Render AST as a page and update file contents.
	file.contents = new Buffer(
		handlebars.partials.file({
			options: options,
			file: file
		})
	);

	this
		.addNavNode(file)
		.addSearchNode(file)
		.push(file);

	// Done
	cb();
};

/**
 * After all of the files have been processed, output the navtree and search
 * index as a JS data file, then pass along unmodified static assets to be
 * written to disk.
 *
 * @method _flush
 * @param {Function} cb
 */
proto._flush = function (cb) {
	var options = this.options,
		theme = options.theme,
		push = this.push.bind(this);

	// Render data.json
	this.push(new File({
		path: 'data.json',
		contents: new Buffer(
			JSON.stringify({
				nav: this.navNodes,
				search: this.searchNodes,
				index: this.searchIndex
			})
		)
	}));

	// Copy static assets
	vinylFs
		.src(options.assets, {
			cwd: theme,
			base: theme
		})
		.pipe(map(function fileToSelf(file, cb) {
			push(file);
			cb();
		}))
		.on('error', cb)
		.on('end', cb);
};

module.exports = Trabea;
