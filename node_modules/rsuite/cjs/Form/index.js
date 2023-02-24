"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
var _exportNames = {};
exports.default = void 0;

var _Form = _interopRequireDefault(require("./Form"));

var _useFormClassNames = require("./useFormClassNames");

Object.keys(_useFormClassNames).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _useFormClassNames[key]) return;
  exports[key] = _useFormClassNames[key];
});
var _default = _Form.default;
exports.default = _default;