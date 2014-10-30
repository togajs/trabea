'use strict';

var layouts = require('handlebars-layouts');
var mixin = require('mtil/object/mixin');

module.exports = function (handlebars) {
    layouts(handlebars);

    handlebars.registerHelper('partial', function (partial, options) {
        var template = handlebars.partials[partial.toLowerCase()];

        // Allow data mixins from options hash
        var context = mixin({}, options.hash, this);

        // Partial template required
        if (typeof template === 'undefined') {
            throw new Error('Missing layout partial: \'' + partial + '\'');
        }

        // Render final layout partial with revised blocks
        if (typeof template === 'function') {
            return template(context);
        }

        // Compile, then render
        return handlebars.compile(template)(context);
    });
};
