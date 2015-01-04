'use strict';

/**
 * # Trabea
 *
 * A theme engine for [Toga](http://togajs.github.io/) documentation.
 *
 * trabea({
 *     static: './assets',
 *     helpers: './helpers',
 *     partials: './partials',
 *     data: './data'
 * })
 */

var proto,
	Transform = require('stream').Transform,
	handlebars = require('handlebars'),
	inherits = require('mtil/function/inherits'),
	mixin = require('mtil/object/mixin'),

	/** Default options. */
	defaults = {
		assets: './assets',
		data: './data',
		helpers: './helpers',
		partials: './partials'
	};

/**
 * @class Tunic
 * @extends Transform
 *
 * @constructor
 * @param {Object} options
 */
function Trabea(options) {
	if (!(this instanceof Trabea)) {
		return new Trabea(options);
	}

	/**
	 * Instance specific options. Values are copied onto a new object so that
	 * the passed-in object isn't accidentally modified.
	 *
	 * @property options
	 * @type {Object}
	 */
	this.options = mixin({}, defaults, options);

	/**
	 * A lookup hash of nav nodes to make it easy to add child nodes.
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
	 * been consumed and generated. This list may be consumed by lunr.js to
	 * create a documentation search mechanism.
	 *
	 * @property searchIndex
	 * @type {Array}
	 */
	this.searchIndex = [];

	Transform.call(this, { objectMode: true });
}

proto = inherits(Trabea, Transform);

/**
 * Updates the `navTree` with a new `navNode` based on the `nav` object in a
 * file's ast. The `navTree` is written to a JSON file after all files have
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

	// Copy ast properties to node
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
 * Takes each file to be documented, processes it, renders the ast as html,
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

	// Append desired extension
	file.path += options.extension;

	// Add nav node
	if (nav) {
		nav.path = file.path.replace(file.base, './');
		this.addNavNode(nav);
	}

	// TODO: Add search index entry

	// Render ast
	file.contents = new Buffer(handlebars.partials.index({
		options: options,
		file: file
	}));

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
	console.log(this.navTree);

	// Done
	cb();
};

module.exports = Trabea;
