'use strict';

var mixin = require('mtil/object/mixin');

/**
 * Registers partial helper on an instance of Handlebars.
 *
 * @type {Function}
 * @param {Object} handlebars Handlebars instance.
 * @return {Object} Handlebars instance.
 */
function partial(handlebars) {
	var helpers = {
		/**
		 * @method partial
		 * @param {String} name
		 * @param {Object} options
		 * @return {String} Rendered partial.
		 */
		partial: function (name, options) {
			var context = mixin({}, options.hash, this),
				template = handlebars.partials[name.toLowerCase()];

			// Partial template required
			if (template == null) {
				throw new Error('Missing partial: \'' + name + '\'');
			}

			// Compile partial, if needed
			if (typeof template !== 'function') {
				template = handlebars.compile(template);
			}

			// Render partial
			return template(context);
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
partial.register = partial;

module.exports = partial;
