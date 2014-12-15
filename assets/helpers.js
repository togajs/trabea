'use strict';

var layouts = require('handlebars-layouts'),
	partial = require('./helpers/partial');

module.exports = function (handlebars) {
	layouts(handlebars);
	partial(handlebars);
};
