'use strict';

var path = require('path');

/**
 * Registers relative helper on an instance of Handlebars.
 *
 * @type {Function}
 * @param {Object} handlebars Handlebars instance.
 * @return {Object} Handlebars instance.
 */
function relative(handlebars) {
	var helpers = {
		/**
		 * @method relative
		 * @param {String} from
		 * @param {Object} to
		 * @return {String} Relative path.
		 */
		relative: function (from, to) {
			return path.relative(from || '', to || '') || '.';
		}
	};

	handlebars.registerHelper(helpers);

	return handlebars;
}

/**
 * Assemble-compatible register method.
 *
 * @method register
 * @param {Object} handlebars Handlebars instance.
 * @return {Object} Handlebars instance.
 * @static
 */
relative.register = relative;

module.exports = relative;
