"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.DisclosureActionTypes = void 0;

var _react = _interopRequireDefault(require("react"));

var DisclosureActionTypes;
exports.DisclosureActionTypes = DisclosureActionTypes;

(function (DisclosureActionTypes) {
  DisclosureActionTypes[DisclosureActionTypes["Show"] = 0] = "Show";
  DisclosureActionTypes[DisclosureActionTypes["Hide"] = 1] = "Hide";
})(DisclosureActionTypes || (exports.DisclosureActionTypes = DisclosureActionTypes = {}));

var DisclosureContext = /*#__PURE__*/_react.default.createContext(null);

DisclosureContext.displayName = 'Disclosure.Context';
var _default = DisclosureContext;
exports.default = _default;