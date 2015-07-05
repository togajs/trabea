'use strict';

var path = require('path');

/**
 * @helper relative
 * @param {String} from
 * @param {Object} to
 * @return {String} Relative path.
 */
module.exports = function relative(from, to) {
  return path.relative(from || '', to || '') || '.';
};