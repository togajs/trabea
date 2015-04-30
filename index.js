/**
 * # Trabea
 *
 * A theme engine for [Toga](http://togajs.github.io/) documentation.
 *
 * @title Trabea
 * @name trabea
 */

import File from 'vinyl';
import handlebars from 'handlebars';
import lunr from 'lunr';
import mixin from 'mtil/object/mixin';
import path from 'path';
import registrar from 'handlebars-registrar';
import requireGlob from 'require-glob';
import through from 'through2';
import vinylFs from 'vinyl-fs';
import { Transform } from 'stream';

/**
 * @class Trabea
 * @extends Stream.Transform
 */
export default class Trabea extends Transform {
	/**
	 * @constructor
	 * @param {Object} options
	 * @param {String} options.assets
	 * @param {String|Array.<String>|Object|Function} options.data
	 * @param {String} options.filename
	 * @param {String|Array.<String>|Object|Function} options.helpers
	 * @param {String} options.name
	 * @param {String|Array.<String>|Object|Function} options.partials
	 * @param {String} options.theme
	 */
	constructor(options = {}) {
		super({ objectMode: true });

		/**
		 * Theme options. Values are copied onto a new object so that the
		 * passed-in object isn't accidentally modified.
		 *
		 * @property {Object} options
		 */
		this.options = mixin({}, Trabea.defaults, options);

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

		this
			.initHandlebars()
			.initLunr()
			.initTemplateData();
	}

	/**
	 * @method initHandlebars
	 * @chainable
	 */
	initHandlebars() {
		var options = this.options;

		registrar(handlebars, {
			cwd: options.theme,
			helpers: options.helpers,
			partials: options.partials
		});

		return this;
	}

	/**
	 * @method initLunr
	 * @chainable
	 */
	initLunr() {
		this.searchIndex = lunr(function () {
			this.field('title', { boost: 10 });
			this.field('name', { boost: 2 });
			this.field('splitPath');
		});

		return this;
	}

	/**
	 * @method initTemplateData
	 * @chainable
	 */
	initTemplateData() {
		var options = this.options;

		this.templateData = requireGlob.sync(options.data, {
			cwd: options.theme
		});

		return this;
	}

	/**
	 * @method handleAsset
	 * @param {Vinyl} file
	 * @param {String} enc
	 * @param {Function(String,Vinyl)} cb
	 */
	handleAsset(file, enc, cb) {
		var fromPlugin = file.fromPlugin || this.options.name;

		file.isAsset = true;
		file.path = path.join(file.base, '.' + fromPlugin, file.path.replace(file.base, ''));

		cb(null, file);
	}

	/**
	 * @method handleAsset
	 * @param {Vinyl} file
	 * @param {String} enc
	 * @param {Function(String,Vinyl)} cb
	 */
	handleSource(file, enc, cb) {
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
	}

	/**
	 * @method registerFileData
	 * @param {File} file
	 * @chainable
	 */
	registerFileData(file) {
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
	}

	/**
	 * @method _transform
	 * @param {String} file
	 * @param {String} enc
	 * @param {Function} cb
	 */
	_transform(file, enc, cb) {
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
	}

	/**
	 * After all of the files have been processed, output the file nodes and search
	 * index as a JSON file, then pass along unmodified static assets to be copied.
	 *
	 * @method _flush
	 * @param {Function} cb
	 */
	_flush(cb) {
		var options = this.options,
			theme = options.theme,
			name = options.name,
			push = this.push.bind(this);

		// Render data.json
		push(new File({
			isAsset: true,
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
	}
}

/**
 * Default options.
 *
 * @property defaults
 * @type {Object.<String,RegExp>}
 * @static
 */
Trabea.defaults = {
	/** The name of this plugin. */
	name: 'trabea',

	/** The file name to use for default pages. */
	filename: 'index.html',

	/** Path to directory containing theme files. */
	theme: path.resolve(__dirname, 'theme'),

	/** Path to directory containing public assets (relative to `theme`). */
	assets: './assets/**',

	/** Path to directory containing data files (relative to `theme`). */
	data: './data/**/*.js{,on}',

	/** Path to directory containing Handlebars helpers (relative to `theme`). */
	helpers: './helpers/**/*.js',

	/** Path to directory containing Handlebars partials (relative to `theme`). */
	partials: './partials/**/*.hbs'
};
