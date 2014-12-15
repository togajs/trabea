'use strict';

var fs = require('fs'),
	dir = __dirname + '/partials',
	ext = /\.hbs$/,
	sep = /\\/g;

module.exports = function (handlebars) {
	fs
		.readdirSync(dir)
		.filter(function (filename) {
			return ext.test(filename);
		})
		.forEach(function (filename) {
			handlebars.registerPartial(
				filename.replace(ext, '').replace(sep, '/'),
				handlebars.compile(fs.readFileSync(dir + '/' + filename, 'utf8'))
			);
		});
};
