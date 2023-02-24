"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var React = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function Import(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.854 8.146l3 3a.5.5 0 010 .707l-3 3a.5.5 0 01-.707-.707L7.293 12H.501a.5.5 0 010-1h6.793L5.147 8.854a.5.5 0 01.707-.707z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M.005 8.309a3.502 3.502 0 013.09-3.286 5.002 5.002 0 019.899 1.231A4.501 4.501 0 0116 10.5c0 2.244-1.642 4.104-3.791 4.469L12 15h-1.5a.5.5 0 010-1h1.435C13.68 13.758 15 12.268 15 10.5a3.501 3.501 0 00-2.159-3.234l-.179-.068-.704-.248.037-.746A4 4 0 004.121 5.02l-.044.197-.142.716-.725.083a2.5 2.5 0 00-2.204 2.319l-.005.165a.5.5 0 01-1 0l.005-.191z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Import);
var _default = ForwardRef;
exports["default"] = _default;