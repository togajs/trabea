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
	handlebars = require('handlebars'),
	inherits = require('mtil/function/inherits'),
	lunr = require('lunr'),
	mixin = require('mtil/object/mixin'),
	path = require('path'),
	registrar = require('handlebars-registrar'),
	requireGlob = require('require-glob'),
	through = require('through2'),
	vinylFs = require('vinyl-fs'),

	// Default options
	defaults = {
		name: 'trabea',
		theme: path.resolve(__dirname, 'theme'),
		assets: './assets/**',
		data: './data/**/*.js{,on}',
		helpers: './helpers/**/*.js',
		partials: './partials/**/*.hbs',
		filename: 'index.html'
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
	 * Object containing the contents of globbed data files.
	 *
	 * @property {Object} templateData
	 */
	this.templateData = null;

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
	var options = this.options;

	this.templateData = requireGlob.sync(options.data, {
		cwd: options.theme
	});

	return this;
};

/**
 * @method registerFileData
 * @param {File} file
 * @chainable
 */
proto.registerFileData = function (file) {
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
 * @method handleAsset
 * @param {Vinyl} file
 * @param {String} enc
 * @param {Function(String,Vinyl)} cb
 * @callback
 */
proto.handleAsset = function (file, enc, cb) {
	var fromPlugin = file.fromPlugin || this.options.name;

	console.log(fromPlugin);
	console.log('file.base', file.base);
	console.log('file.path', file.path);

	file.path = path.join(file.base, '.' + fromPlugin, file.path.replace(file.base, ''));

	console.log('file.path', file.path);

	cb(null, file);
};

/**
 * @method handleAsset
 * @param {Vinyl} file
 * @param {String} enc
 * @param {Function(String,Vinyl)} cb
 * @callback
 */
proto.handleSource = function (file, enc, cb) {
	var options = this.options,
		data = this.templateData;

	// Append desired filename
	file.originalPath = file.path;
	file.path = path.join(file.path, options.filename);

	// Render AST as a page and update file contents.
	file.contents = new Buffer(
		handlebars.partials.index({
			data: data,
			options: options,
			file: file
		})
	);

	// Register
	this.registerFileData(file);

	// Done
	cb(null, file);
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
	if (!file) {
		return cb();
	}

	if (file.isAsset) {
		return this.handleAsset(file, enc, cb);
	}

	if (file.ast) {
		return this.handleSource(file, enc, cb);
	}

	cb();
};

/**
 * After all of the files have been processed, output the file nodes and search
 * index as a JSON file, then pass along unmodified static assets to be copied.
 *
 * @method _flush
 * @param {Function} cb
 */
proto._flush = function (cb) {
	var options = this.options,
		theme = options.theme,
		name = options.name,
		push = this.push.bind(this);

	// Render data.json
	push(new File({
		path: path.join('.' + name, 'data.json'),
		contents: new Buffer(
			JSON.stringify({
				fileNodes: this.fileNodes,
				searchIndex: this.searchIndex
			}, null, 2)
		)
	}));

	// Copy static assets
	vinylFs
		.src(options.assets, { cwd: theme, base: theme })
		.pipe(through.obj(this.handleAsset.bind(this)))
		.on('data', push)
		.on('error', cb)
		.on('end', cb);
};

module.exports = Trabea;
