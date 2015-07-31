/**
 * # Trabea
 *
 * A base compiler for [Toga](http://togajs.com) documentation. Takes
 * abstract syntax trees and generates the final documenation output.
 *
 * @title Trabea
 * @name trabea
 */

import { join } from 'path';
import { Transform } from 'stream';

// import handlebars from 'handlebars';
// import lunr from 'lunr';
// import registrar from 'handlebars-registrar';
// import requireGlob from 'require-glob';
// import { join, relative } from 'path';

/**
 * @class Trabea
 * @extends Stream.Transform
 */
export default class Trabea extends Transform {
	/**
	 * @property {Object} options
	 */
	options = null;

	/**
	 * Default options.
	 *
	 * @property {Object} defaults
	 * @static
	 */
	static defaults = {
		/** The name of the property containing a documentation AST. */
		property: 'docAst',

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
	}

	/**
	 * @method _transform
	 * @param {String} file
	 * @param {String} encoding
	 * @param {Function} next
	 */
	_transform(file, encoding, next) {
		next();
	}

	/**
	 * @method _flush
	 * @param {Function} next
	 */
	_flush(next) {
		next();
	}

	// #<{(|*
	//  * A list containing objects with a subset of file data to be used
	//  * client-side in generating navigation and search results.
	//  *
	//  * @property {Array} fileNodes
	//  |)}>#
	// fileNodes = [];
    //
	// #<{(|*
	//  * A Lunr instance for generating a search index to be used client-side.
	//  *
	//  * @property {Lunr} searchIndex
	//  |)}>#
	// searchIndex = null;
    //
	// #<{(|*
	//  * Object containing the contents of globbed data files.
	//  *
	//  * @property {Object} templateData
	//  |)}>#
	// templateData = null;
    //
	// #<{(|*
	//  * @constructor
	//  * @param {Object} options
	//  |)}>#
	// constructor(options) {
	// 	super({ objectMode: true });
    //
	// 	this.options = {
	// 		...Trabea.defaults,
	// 		...options
	// 	};
    //
	// 	this
	// 		.initSearchEngine()
	// 		.initTemplateData()
	// 		.initTemplateEngine();
	// }
    //
	// #<{(|*
	//  * @method initSearchEngine
	//  * @chainable
	//  |)}>#
	// initSearchEngine() {
	// 	this.searchIndex = lunr(function () {
	// 		this.field('title', { boost: 10 });
	// 		this.field('name', { boost: 2 });
	// 		this.field('splitPath');
	// 	});
    //
	// 	return this;
	// }
    //
	// #<{(|*
	//  * @method initTemplateData
	//  * @chainable
	//  |)}>#
	// initTemplateData() {
	// 	var { data, theme } = this.options;
    //
	// 	this.templateData = requireGlob.sync(data, {
	// 		cwd: theme
	// 	});
    //
	// 	return this;
	// }
    //
	// #<{(|*
	//  * @method initTemplateEngine
	//  * @chainable
	//  |)}>#
	// initTemplateEngine() {
	// 	var { helpers, partials, theme } = this.options;
    //
	// 	registrar(handlebars, {
	// 		cwd: theme,
	// 		helpers,
	// 		partials
	// 	});
    //
	// 	return this;
	// }
    //
	// #<{(|*
	//  * @method pushAsset
	//  * @param {Vinyl} file
	//  * @param {String} encoding
	//  * @param {Function(String,Vinyl)} next
	//  |)}>#
	// pushAsset(file, encoding, next) {
	// 	var fromPlugin = file.fromPlugin;
    //
	// 	if (typeof fromPlugin !== 'string') {
	// 		throw new Error('Asset missing required `fromPlugin` property.');
	// 	}
    //
	// 	file.isAsset = true;
	// 	file.path = join(
	// 		file.base,
	// 		'.' + fromPlugin,
	// 		file.path.replace(file.base, '')
	// 	);
    //
	// 	this.push(file);
	// 	next();
	// }
    //
	// #<{(|*
	//  * @method pushSource
	//  * @param {Vinyl} file
	//  * @param {String} encoding
	//  * @param {Function(String,Vinyl)} next
	//  |)}>#
	// pushSource(file, encoding, next) {
	// 	var options = this.options,
	// 		data = this.templateData;
    //
	// 	// Append desired filename
	// 	file.path = join(file.path, options.filename);
    //
	// 	// Render AST as a page and update file contents.
	// 	file.contents = new Buffer(
	// 		handlebars.partials.index({
	// 			data,
	// 			options,
	// 			file
	// 		})
	// 	);
    //
	// 	// Register
	// 	this.registerFileData(file);
    //
	// 	// Done
	// 	this.push(file);
	// 	next();
	// }
    //
	// #<{(|*
	//  * @method registerFileData
	//  * @param {File} file
	//  * @chainable
	//  |)}>#
	// registerFileData(file) {
	// 	if (!file) {
	// 		return this;
	// 	}
    //
	// 	var { fileNodes, searchIndex } = this,
	// 		{ property } = this.options,
	// 		index = fileNodes.length,
	// 		filePath = relative(
	// 			file.base || '',
	// 			file.path || ''
	// 		);
    //
	// 	// Store file data for client-side
	// 	fileNodes.push({
	// 		path: filePath
	// 	});
    //
	// 	// Add record containing searchable data
	// 	searchIndex.add({
	// 		id: index,
	// 		splitPath: filePath.replace(/\//g, ' ')
	// 	});
    //
	// 	return this;
	// }
    //
	// #<{(|*
	//  * @method _transform
	//  * @param {String} file
	//  * @param {String} encoding
	//  * @param {Function} next
	//  |)}>#
	// _transform(file, encoding, next) {
	// 	if (!file) {
	// 		return next();
	// 	}
    //
	// 	if (file.isAsset) {
	// 		return this.pushAsset(file, encoding, next);
	// 	}
    //
	// 	if (file[this.options.property]) {
	// 		return this.pushSource(file, encoding, next);
	// 	}
    //
	// 	next();
	// }
    //
	// #<{(|*
	//  * After all of the files have been processed, output the file nodes and search
	//  * index as a JSON file, then pass along unmodified static assets to be copied.
	//  *
	//  * @method _flush
	//  * @param {Function(?String)} next
	//  |)}>#
	// _flush(next) {
	// 	var { assets, name, theme } = this.options,
	// 		push = this.push.bind(this);
    //
	// 	push(new File({
	// 		isAsset: true,
	// 		fromPlugin: name,
	// 		path: join('.' + name, 'data.json'),
	// 		contents: new Buffer(
	// 			JSON.stringify({
	// 				fileNodes: this.fileNodes,
	// 				searchIndex: this.searchIndex
	// 			}, null, 2)
	// 		)
	// 	}));
    //
	// 	if (!assets) {
	// 		return next();
	// 	}
    //
	// 	vinylFs
	// 		.src(assets, { cwd: theme, base: theme })
	// 		.pipe(through.obj(this.pushAsset.bind(this)))
	// 		.on('data', push)
	// 		.on('error', next)
	// 		.on('end', next);
	// }
}
