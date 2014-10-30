'use strict';

var fs = require('fs');

var dir = __dirname + '/../templates';
var ext = /\.hbs$/;
var sep = /\\/g;

module.exports = function (handlebars) {
    fs.readdirSync(dir)
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
