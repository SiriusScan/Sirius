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

function LogoAnalytics(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M28.985 3.598H3.015C1.353 3.598 0 4.983 0 6.688v18.626c0 1.705 1.353 3.088 3.015 3.088h25.966c1.664 0 3.017-1.383 3.017-3.088V6.688c.002-1.705-1.351-3.09-3.013-3.09zm.222 21.714a.231.231 0 01-.226.233H3.015a.23.23 0 01-.229-.233V9.09h26.421v16.222z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.286 23.031c.917 0 1.657-.743 1.657-1.655 0-.183-.05-.347-.105-.514l3.833-3.707c.178.069.366.119.567.119.233 0 .457-.053.661-.139l4.375 3.817c-.039.137-.085.274-.085.425a1.658 1.658 0 003.316 0c0-.215-.048-.421-.126-.613l4.859-5.248c.153.043.304.094.473.094a1.657 1.657 0 100-3.316c-.916 0-1.657.745-1.657 1.659 0 .215.048.418.123.606l-4.859 5.248c-.151-.043-.302-.094-.469-.094-.233 0-.457.05-.658.137l-4.377-3.815c.039-.139.087-.274.087-.425a1.66 1.66 0 00-3.319 0c0 .183.05.347.105.51l-3.833 3.707a1.639 1.639 0 00-.569-.114 1.66 1.66 0 100 3.319z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LogoAnalytics);
var _default = ForwardRef;
exports["default"] = _default;