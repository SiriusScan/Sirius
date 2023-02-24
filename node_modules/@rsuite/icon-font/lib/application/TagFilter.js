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

function TagFilter(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.5 0a.5.5 0 01.293.095l.06.051 4 4a.5.5 0 01-.638.765l-.069-.058L6.293.999H1.5a.5.5 0 00-.492.41L1 1.499v4.793l5.854 5.853a.5.5 0 01.058.638l-.058.069a.5.5 0 01-.638.058l-.069-.058-6-6a.495.495 0 01-.14-.275l-.006-.079v-5A1.5 1.5 0 011.357.005l.144-.007h5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 4a1 1 0 11-2 0 1 1 0 012 0zM13.5 7a.5.5 0 01.09.992L13.5 8H8.587l2.293 2.675c.058.068.097.15.112.237L11 11v3.191l1 .5V11c0-.089.024-.177.069-.253l.052-.072 3-3.5a.5.5 0 01.812.578l-.052.073-2.88 3.359v4.316a.5.5 0 01-.646.478l-.078-.031-2-1a.503.503 0 01-.268-.354L10 14.501v-3.315l-2.88-3.36a.5.5 0 01.297-.819l.083-.006h6z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TagFilter);
var _default = ForwardRef;
exports["default"] = _default;