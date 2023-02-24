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
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.75 12.25v.875h1.75c1.969-.242 3.5-1.911 3.5-3.938a3.938 3.938 0 00-2.631-3.715 4.375 4.375 0 00-8.661-1.077A3.063 3.063 0 000 7.437h.875c0-1.114.837-2.047 1.934-2.173l.634-.073.124-.626a3.501 3.501 0 016.929.863l-.033.652.616.217a3.064 3.064 0 012.046 2.89 3.105 3.105 0 01-2.682 3.063H8.75z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M.438 10.5a.438.438 0 110-.876h6.125a.438.438 0 110 .876H.438z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.128 9.753a.438.438 0 11.619.619l-2.625 2.625a.438.438 0 11-.619-.619l2.625-2.625z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.128 10.372L4.503 7.747a.438.438 0 11.619-.619l2.625 2.625a.438.438 0 11-.619.619z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Import);
var _default = ForwardRef;
exports["default"] = _default;