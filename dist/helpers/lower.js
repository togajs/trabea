'use strict';

/**
 * @helper lower
 * @param {*} value
 * @return {*} The value, lowercased
 */
module.exports = function lower(value) {
  return value == null ? '' : String(value).toLowerCase();
};