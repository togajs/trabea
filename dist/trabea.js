/**
 * # Trabea
 *
 * A base compiler for [Toga](http://togajs.con) documentation. Takes
 * abstract syntax trees and generates the final documenation output.
 *
 * @title Trabea
 * @name trabea
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _lunr = require('lunr');

var _lunr2 = _interopRequireDefault(_lunr);

var _handlebarsRegistrar = require('handlebars-registrar');

var _handlebarsRegistrar2 = _interopRequireDefault(_handlebarsRegistrar);

var _requireGlob = require('require-glob');

var _requireGlob2 = _interopRequireDefault(_requireGlob);

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

var _vinylFs = require('vinyl-fs');

var _vinylFs2 = _interopRequireDefault(_vinylFs);

var _stream = require('stream');

var _path = require('path');

/**
 * @class Trabea
 * @extends Stream.Transform
 */

var Trabea = (function (_Transform) {

	/**
  * @constructor
  * @param {Object} options
  * @param {String|Array.<String>|Object|Function} options.data
  * @param {String} options.filename
  * @param {String|Array.<String>|Object|Function} options.helpers
  * @param {String|Array.<String>|Object|Function} options.partials
  * @param {String} options.theme
  */

	function Trabea(options) {
		_classCallCheck(this, Trabea);

		_get(Object.getPrototypeOf(Trabea.prototype), 'constructor', this).call(this, { objectMode: true });

		this.__initializeProperties();

		this.options = _extends({}, Trabea.defaults, options);

		this.initHandlebars().initLunr().initTemplateData();
	}

	_inherits(Trabea, _Transform);

	_createClass(Trabea, [{
		key: 'initHandlebars',

		/**
   * @method initHandlebars
   * @chainable
   */
		value: function initHandlebars() {
			var _options = this.options;
			var helpers = _options.helpers;
			var partials = _options.partials;
			var theme = _options.theme;

			(0, _handlebarsRegistrar2['default'])(_handlebars2['default'], {
				cwd: theme,
				helpers: helpers,
				partials: partials
			});

			return this;
		}
	}, {
		key: 'initLunr',

		/**
   * @method initLunr
   * @chainable
   */
		value: function initLunr() {
			this.searchIndex = (0, _lunr2['default'])(function () {
				this.field('title', { boost: 10 });
				this.field('name', { boost: 2 });
				this.field('splitPath');
			});

			return this;
		}
	}, {
		key: 'initTemplateData',

		/**
   * @method initTemplateData
   * @chainable
   */
		value: function initTemplateData() {
			var _options2 = this.options;
			var data = _options2.data;
			var theme = _options2.theme;

			this.templateData = _requireGlob2['default'].sync(data, {
				cwd: theme
			});

			return this;
		}
	}, {
		key: 'handleAsset',

		/**
   * @method handleAsset
   * @param {Vinyl} file
   * @param {String} enc
   * @param {Function(String,Vinyl)} cb
   */
		value: function handleAsset(file, enc, cb) {
			var fromPlugin = file.fromPlugin || this.options.name;

			file.isAsset = true;
			file.path = (0, _path.join)(file.base, '.' + fromPlugin, file.path.replace(file.base, ''));

			cb(null, file);
		}
	}, {
		key: 'handleSource',

		/**
   * @method handleSource
   * @param {Vinyl} file
   * @param {String} enc
   * @param {Function(String,Vinyl)} cb
   */
		value: function handleSource(file, enc, cb) {
			var options = this.options,
			    data = this.templateData;

			// Append desired filename
			file.originalPath = file.path;
			file.path = (0, _path.join)(file.path, options.filename);

			// Render AST as a page and update file contents.
			file.contents = new Buffer(_handlebars2['default'].partials.index({
				data: data,
				options: options,
				file: file
			}));

			// Register
			this.registerFileData(file);

			// Done
			cb(null, file);
		}
	}, {
		key: 'registerFileData',

		/**
   * @method registerFileData
   * @param {File} file
   * @chainable
   */
		value: function registerFileData(file) {
			if (!file) {
				return this;
			}

			var fileNodes = this.fileNodes;
			var searchIndex = this.searchIndex;
			var index = fileNodes.length;
			var filePath = (0, _path.relative)(file.base || '', file.path || '');
			var ast = file.ast || {};
			var nav = ast.nav || {};

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
	}, {
		key: '_transform',

		/**
   * @method _transform
   * @param {String} file
   * @param {String} enc
   * @param {Function} cb
   */
		value: function _transform(file, enc, cb) {
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
	}, {
		key: '_flush',

		/**
   * After all of the files have been processed, output the file nodes and search
   * index as a JSON file, then pass along unmodified static assets to be copied.
   *
   * @method _flush
   * @param {Function(?String)} done
   */
		value: function _flush(done) {
			var _options3 = this.options;
			var assets = _options3.assets;
			var name = _options3.name;
			var theme = _options3.theme;
			var push = this.push.bind(this);

			push(new _vinyl2['default']({
				isAsset: true,
				path: (0, _path.join)('.' + name, 'data.json'),
				contents: new Buffer(JSON.stringify({
					fileNodes: this.fileNodes,
					searchIndex: this.searchIndex
				}, null, 2))
			}));

			if (!assets) {
				return done();
			}

			_vinylFs2['default'].src(assets, { cwd: theme, base: theme }).pipe(_through22['default'].obj(this.handleAsset.bind(this))).on('data', push).on('error', done).on('end', done);
		}
	}, {
		key: '__initializeProperties',
		value: function __initializeProperties() {
			this.fileNodes = [];
			this.options = null;
			this.searchIndex = null;
			this.templateData = null;
		}
	}], [{
		key: 'defaults',

		/**
   * Default options.
   *
   * @property {Object} defaults
   * @static
   */
		value: {
			/** The name of this plugin. */
			name: 'trabea',

			/** The file name to use for default pages. */
			filename: 'index.html',

			/** Path to directory containing theme files. */
			theme: __dirname,

			/** Path to directory containing public assets (relative to `theme`). */
			assets: './assets/**',

			/** Path to directory containing data files (relative to `theme`). */
			data: './data/**/*.js{,on}',

			/** Path to directory containing Handlebars helpers (relative to `theme`). */
			helpers: './helpers/**/*.js',

			/** Path to directory containing Handlebars partials (relative to `theme`). */
			partials: './partials/**/*.hbs'
		},
		enumerable: true
	}]);

	return Trabea;
})(_stream.Transform);

exports['default'] = Trabea;
module.exports = exports['default'];

/**
 * A list containing objects with a subset of file data to be used
 * client-side in generating navigation and search results.
 *
 * @property {Array} fileNodes
 */

/**
 * @property {Object} options
 */

/**
 * A Lunr instance for generating a search index to be used client-side.
 *
 * @property {Lunr} searchIndex
 */

/**
 * Object containing the contents of globbed data files.
 *
 * @property {Object} templateData
 */
