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

function MultipleLinesChart(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 14 14",
    width: "1em",
    height: "1em",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M.9 13.1V0H0v14h14v-.9z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2.5 11.1c-.1 0-.2 0-.3-.1-.2-.2-.2-.4 0-.6l2.5-2.5 1.9 1.3 5.6-6.3c.2-.2.4-.2.6 0 .2.2.2.4 0 .6l-6.1 6.8L4.8 9l-2 2c-.1.1-.2.1-.3.1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12.5 9.5c-.1 0-.2 0-.3-.1L7.5 4.5 6 5.8 4.5 4.1l-2 1.8c-.2.1-.4.1-.6-.1-.2-.2-.1-.5 0-.6l2.6-2.3 1.6 1.7 1.5-1.3 5.2 5.5c.2.2.2.5 0 .6-.1 0-.2.1-.3.1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(MultipleLinesChart);
var _default = ForwardRef;
exports["default"] = _default;