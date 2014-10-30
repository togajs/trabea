'use strict';

/**
 * # Stole
 *
 * A theme engine for [Toga](http://togajs.github.io/) documentation.
 */

var proto,
	File = require('vinyl'),
	Transform = require('stream').Transform,
	handlebars = require('handlebars'),
	inherits = require('mtil/function/inherits'),
	mixin = require('mtil/object/mixin');

require('./assets/helpers')(handlebars);
require('./assets/partials')(handlebars);

/**
 * @class Stole
 * @extends Transform
 *
 * @constructor
 * @param {Object} options
 */
function Stole(options) {
	if (!(this instanceof Stole)) {
		return new Stole(options);
	}

	/**
	 * @property options
	 * @type {Object}
	 */
	this.options = mixin({}, this.defaults, options);

	/**
	 * @property data
	 * @type {Object}
	 */
	this.data = {};

	Transform.call(this, { objectMode: true });
}

proto = inherits(Stole, Transform);

/**
 * Default options.
 *
 * @property defaults
 * @type {Object}
 */
proto.defaults = {
	title: 'Documentation'
};

/**
 * @method _transform
 * @param {Vinyl} file
 * @param {String} enc
 * @param {Function} cb
 */
proto._transform = function (file, enc, cb) {
	var options = this.options,
		path = file && file.path,
		toga = file && file.toga,
		ast = toga && toga.ast;

	if (!ast) {
		return cb();
	}

	// Create new path (this is gross)
	file.path = file.base + file.path.replace(file.cwd, '').replace(/[\\\/]/g, '_') + '.html';

	// Create new contents
	file.contents = new Buffer(handlebars.partials.index({
		title: options.title,
		path: path.replace(file.cwd, ''),
		ext: path.split('.').pop(),
		ast: ast
	}));

	this.push(file);

	cb();
};

/**
 * @method _flush
 * @param {Function} cb
 */
proto._flush = function (cb) {
	this.push(new File({
		path: 'data.json',
		contents: new Buffer(JSON.stringify(this.data, null, 2))
	}));

	cb();
};

module.exports = Stole;
