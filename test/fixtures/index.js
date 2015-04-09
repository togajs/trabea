/**
 * # Trabea
 *
 * A theme engine for [Toga](http://togajs.github.io/) documentation.
 *
 * @title Trabea
 * @name trabea
 */

'use strict';

var proto,
	File = require('vinyl'),
	Transform = require('stream').Transform,
	glob = require('globby'),
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
		data: './data/**/*.js{,on}',
		helpers: './helpers/**/*.js',
		partials: './partials/**/*.hbs',
		extension: '.html'
	};

/**
 * @class Trabea
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
	 * @property {Object} options
	 */
	this.options = mixin({}, defaults, options);

	/**
	 * A list containing objects with a subset of file data to be used
	 * client-side in generating navigation and search results.
	 *
	 * @property {Array} fileNodes
	 */
	this.fileNodes = [];

	/**
	 * A Lunr instance for generating a search index to be used client-side.
	 *
	 * @property {Lunr} searchIndex
	 */
	this.searchIndex = null;

	/**
	 * @property {Object} templateData
	 */
	this.templateData = {};

	/**
	 * @property {Number} uidCounter
	 */
	this.uidCounter = 0;

	Transform.call(this, {
		objectMode: true
	});

	this
		.initHandlebars()
		.initLunr()
		.initTemplateData();
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
		this.field('title', { boost: 10 });
		this.field('name', { boost: 2 });
		this.field('splitPath');
	});

	return this;
};

/**
 * @method initTemplateData
 * @chainable
 */
proto.initTemplateData = function () {
	var data = this.templateData,
		options = this.options,
		cwd = options.theme;

	glob
		.sync(options.data, { cwd: cwd })
		.forEach(function (file) {
			file = path.resolve(cwd, file);

			// Clear cached module, if any
			delete require.cache[require.resolve(file)];

			// Add object properties to data object
			return mixin(data, require(file));
		});

	return this;
};

/**
 * @method registerFile
 * @param {File} file
 * @chainable
 */
proto.registerFile = function (file) {
	if (!file) {
		return this;
	}

	var searchIndex = this.searchIndex,
		fileNodes = this.fileNodes,
		index = fileNodes.length,
		filePath = path.relative(file.base || '', file.path || ''),
		ast = file.ast || {},
		nav = ast.nav || {};

	// Store file data for client-side
	fileNodes.push({
		name: nav.name,
		parent: nav.parent,
		path: filePath,
		title: nav.title
	});

	// Add record containing searchable data
	searchIndex.add({
		id: index,
		name: nav.name,
		parent: nav.parent,
		splitPath: filePath.replace(/\//g, ' '),
		title: nav.title
	});

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
	var data = this.templateData,
		options = this.options;

	// Nothing to do
	if (!file || !file.ast) {
		return cb();
	}

	// Expose parent directory for resolving relative paths
	file.dirname = path.dirname(file.path);

	// Append desired extension
	file.path += options.extension;

	console.log(file.history);

	// Render AST as a page and update file contents.
	file.contents = new Buffer(
		handlebars.partials.file({
			data: data,
			options: options,
			file: file
		})
	);

	this
		.registerFile(file)
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
	push(new File({
		path: 'data.json',
		contents: new Buffer(
			JSON.stringify({
				files: this.fileNodes,
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
		.pipe(map(function (file, cb) {
			push(file);
			cb();
		}))
		.on('error', cb)
		.on('end', cb);
};

module.exports = Trabea;
