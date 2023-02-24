"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
var _exportNames = {};
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var helpers = _interopRequireWildcard(require("dom-lib"));

Object.keys(helpers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === helpers[key]) return;
  exports[key] = helpers[key];
});

var _isElement = _interopRequireDefault(require("./isElement"));

var DOMHelper = (0, _extends2.default)({}, helpers, {
  isElement: _isElement.default
});
var _default = DOMHelper;
exports.default = _default;