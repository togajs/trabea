/**
 * # Trabea
 *
 * A base compiler for [Toga](http://togajs.com) documentation. Takes
 * abstract syntax trees and generates the final documenation output.
 *
 * @title Trabea
 * @name trabea
 */

import File from 'vinyl';
import handlebars from 'handlebars';
import lunr from 'lunr';
import registrar from 'handlebars-registrar';
import requireGlob from 'require-glob';
import through from 'through2';
import vinylFs from 'vinyl-fs';
import { Transform } from 'stream';
import { join, relative } from 'path';

/**
 * @class Trabea
 * @extends Stream.Transform
 */
export default class Trabea extends Transform {
	/**
	 * A list containing objects with a subset of file data to be used
	 * client-side in generating navigation and search results.
	 *
	 * @property {Array} fileNodes
	 */
	fileNodes = [];

	/**
	 * @property {Object} options
	 */
	options = null;

	/**
	 * A Lunr instance for generating a search index to be used client-side.
	 *
	 * @property {Lunr} searchIndex
	 */
	searchIndex = null;

	/**
	 * Object containing the contents of globbed data files.
	 *
	 * @property {Object} templateData
	 */
	templateData = null;

	/**
	 * Default options.
	 *
	 * @property {Object} defaults
	 * @static
	 */
	static defaults = {
		/** The name of this plugin. */
		name: 'trabea',

		/** The file name to use for default pages. */
		filename: 'index.html',

		/** Path to directory containing theme files. */
		theme: join(__dirname, 'theme'),

		/** Path to directory containing public assets (relative to `theme`). */
		assets: './assets/**',

		/** Path to directory containing data files (relative to `theme`). */
		data: './data/**/*.js{,on}',

		/** Path to directory containing Handlebars helpers (relative to `theme`). */
		helpers: './helpers/**/*.js',

		/** Path to directory containing Handlebars partials (relative to `theme`). */
		partials: './partials/**/*.hbs'
	};

	/**
	 * @constructor
	 * @param {Object} options
	 */
	constructor(options) {
		super({ objectMode: true });

		this.options = {
			...Trabea.defaults,
			...options
		};

		this
			.initSearchEngine()
			.initTemplateData()
			.initTemplateEngine();
	}

	/**
	 * @method initSearchEngine
	 * @chainable
	 */
	initSearchEngine() {
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
		var { data, theme } = this.options;

		this.templateData = requireGlob.sync(data, {
			cwd: theme
		});

		return this;
	}

	/**
	 * @method initTemplateEngine
	 * @chainable
	 */
	initTemplateEngine() {
		var { helpers, partials, theme } = this.options;

		registrar(handlebars, {
			cwd: theme,
			helpers: helpers,
			partials: partials
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
		file.path = join(
			file.base,
			'.' + fromPlugin,
			file.path.replace(file.base, '')
		);

		cb(null, file);
	}

	/**
	 * @method handleSource
	 * @param {Vinyl} file
	 * @param {String} enc
	 * @param {Function(String,Vinyl)} cb
	 */
	handleSource(file, enc, cb) {
		var options = this.options,
			data = this.templateData;

		// Append desired filename
		file.originalPath = file.path;
		file.path = join(file.path, options.filename);

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

		var { fileNodes, searchIndex } = this,
			index = fileNodes.length,
			filePath = relative(file.base || '', file.path || ''),
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
	 * @param {Function(?String)} done
	 */
	_flush(done) {
		var { assets, name, theme } = this.options,
			push = this.push.bind(this);

		push(new File({
			isAsset: true,
			path: join('.' + name, 'data.json'),
			contents: new Buffer(
				JSON.stringify({
					fileNodes: this.fileNodes,
					searchIndex: this.searchIndex
				}, null, 2)
			)
		}));

		if (!assets) {
			return done();
		}

		vinylFs
			.src(assets, { cwd: theme, base: theme })
			.pipe(through.obj(this.handleAsset.bind(this)))
			.on('data', push)
			.on('error', done)
			.on('end', done);
	}
}
