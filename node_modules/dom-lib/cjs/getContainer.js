"use strict";

exports.__esModule = true;
exports["default"] = getContainer;

/**
 * Get a DOM container
 * @param container
 * @param defaultContainer
 * @returns
 */
function getContainer(container, defaultContainer) {
  container = typeof container === 'function' ? container() : container;
  return container || defaultContainer;
}

module.exports = exports.default;