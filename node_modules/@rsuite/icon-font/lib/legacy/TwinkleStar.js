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

function TwinkleStar(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.197 5.79l2.407 4.871.354.722 6.174.898-4.469 4.352.137.795.919 5.355-5.522-2.905-5.522 2.903.919-5.355.137-.793-.578-.56-3.888-3.792 6.171-.898.357-.72 2.405-4.873zm0-3.461l-3.778 7.653-8.446 1.23 6.112 5.957-1.442 8.411 7.554-3.973 7.557 3.973-1.445-8.411 6.112-5.957-8.446-1.23-3.778-7.653z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.503 30.935l1.694-6.955 1.694 6.955zM0 19.049l7.125-.715-6 3.909zM7.6 1.227l3.045 6.48L4.963 3.35zM26.807 2.846L21.708 7.87l2.222-6.805zM31.278 21.031l-6.434-3.138 7.157-.169z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TwinkleStar);
var _default = ForwardRef;
exports["default"] = _default;