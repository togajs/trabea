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
	/**
	 * Support functional execution.
	 */
	if (!(this instanceof Trabea)) {
		return new Trabea(options);
	}

	/**
	 * Create options object. Values are copied onto a new object so that the
	 * passed-in object isn't accidentally modified.
	 */
	options = mixin({}, defaults, options);

	/**
	 * Theme options.
	 *
	 * @property options
	 * @type {Object}
	 */
	this.options = options;

	/**
	 * A lookup object of nav nodes to make it easy to add leaves to the tree.
	 *
	 * @property navNodes
	 * @type {Object}
	 */
	this.navNodes = {};

	/**
	 * The `navTree` is written to a JSON file after all other files have been
	 * consumed and generated. This list may be consumed by a client-side script
	 * to create dynamic navigation.
	 *
	 * @property navTree
	 * @type {Array}
	 */
	this.navTree = [];

	/**
	 * The `searchIndex` is written to a JSON file after all other files have
	 * been consumed and generated. This list may be consumed by a client-side
	 * script to create a documentation search mechanism.
	 *
	 * @property searchIndex
	 * @type {Array}
	 */
	this.searchIndex = [];

	// Register Handlebars helpers and partials
	registrar(handlebars, {
		cwd: options.theme,
		helpers: options.helpers,
		partials: options.partials
	});

	Transform.call(this, { objectMode: true });
}

proto = inherits(Trabea, Transform);

/**
 * Updates the `navTree` with a new `navNode` based on the `nav` object in a
 * file's AST. The `navTree` is written to a JSON file after all files have
 * been consumed.
 *
 * @method addNavNode
 * @param {Object} astNode
 * @chainable
 */
proto.addNavNode = function (astNode) {
	var navNode,
		name = astNode && astNode.name,
		parent = astNode && astNode.parent;

	// Nothing to do
	if (name == null) {
		return this;
	}

	// Get or create navNode
	navNode = this.getNavNode(name);

	// Copy AST properties to node
	mixin(navNode, astNode);

	if (!parent) {
		// Add node to root of navTree
		this.navTree
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
 * Gets or creates a `navNode` for use in the `navTree`.
 *
 * @method getNavNode
 * @param {String} name
 * @return {Object}
 */
proto.getNavNode = function (name) {
	var navNodes = this.navNodes;

	return navNodes[name] || (navNodes[name] = {
		children: []
	});
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
		ast = file && file.ast,
		nav = ast && ast.nav;

	// Nothing to do
	if (!ast) {
		return cb();
	}

	// Expose parent directory for resolving relative paths
	file.dirname = path.dirname(file.path);

	// Append desired extension
	file.path += options.extension;

	// Render AST as a page and update file contents
	file.contents = new Buffer(
		handlebars.partials.page({
			options: options,
			file: file
		})
	);

	// Add nav node
	if (nav) {
		nav.path = file.path.replace(file.base, './');
		this.addNavNode(nav);
	}

	// TODO: Add search index entry

	// Pass along
	this.push(file);

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

	// Generate nav.json
	this.push(new File({
		path: 'nav.json',
		contents: new Buffer(
			JSON.stringify(this.navTree, null, 2)
		)
	}));

	// Generate search.json
	this.push(new File({
		path: 'search.json',
		contents: new Buffer(
			JSON.stringify(this.searchIndex, null, 2)
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
