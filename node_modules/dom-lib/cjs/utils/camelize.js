"use strict";

exports.__esModule = true;
exports["default"] = void 0;
var hyphenPattern = /-(.)/g;
/**
 * Camelcases a hyphenated string, for example:
 *
 *   > camelize('background-color')
 *   < "backgroundColor"
 *
 * @param {string} string
 * @return {string}
 */

function camelize(string) {
  return string.replace(hyphenPattern, function (_, character) {
    return character.toUpperCase();
  });
}

var _default = camelize;
exports["default"] = _default;
module.exports = exports.default;