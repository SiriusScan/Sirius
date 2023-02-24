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

function Export(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4 15c-2.25-.276-4-2.184-4-4.5a4.501 4.501 0 013.006-4.246 5 5 0 019.899-1.231 3.5 3.5 0 013.09 3.286L16 8.5a.5.5 0 01-1 0 2.5 2.5 0 00-2.21-2.483l-.725-.083-.142-.716a4.002 4.002 0 00-7.924.783L4 6.103l.041.847-.704.248a3.503 3.503 0 00-2.338 3.303c0 1.768 1.32 3.258 3.065 3.5h1.435a.5.5 0 010 1h-1.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11.854 8.146l3 3a.5.5 0 010 .707l-3 3a.5.5 0 01-.707-.707L13.293 12H6.501a.5.5 0 010-1h6.793l-2.147-2.146a.5.5 0 01.707-.707z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Export);
var _default = ForwardRef;
exports["default"] = _default;