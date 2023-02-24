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

function Notice(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8 0a1 1 0 011 1v1l-.006.111a4.471 4.471 0 013.448 3.864L13 10.999l2 2a.5.5 0 010 1H1a.5.5 0 010-1l2-2 .558-5.024a4.471 4.471 0 013.448-3.864A1.018 1.018 0 017 2V1a1 1 0 011-1zm0 3a3.469 3.469 0 00-3.448 3.086l-.597 5.373L2.414 13h11.172l-1.541-1.541-.597-5.373A3.469 3.469 0 008 3zM6.5 15h3a.5.5 0 010 1h-3a.5.5 0 010-1zM4.418 1.007a.5.5 0 01.164.986C2.85 2.282 2 3.557 2 6a.5.5 0 01-1 0c0-2.891 1.15-4.615 3.418-4.993zM11.582 1.007a.5.5 0 00-.164.986C13.15 2.282 14 3.557 14 6a.5.5 0 001 0c0-2.891-1.15-4.615-3.418-4.993z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Notice);
var _default = ForwardRef;
exports["default"] = _default;