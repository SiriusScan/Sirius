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

function Trend(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.688 5.25c.242 0 .438.196.438.438v7.875a.438.438 0 11-.876 0V5.688c0-.242.196-.438.438-.438zM2.188 9.625c.242 0 .438.196.438.438v3.5a.438.438 0 11-.876 0v-3.5c0-.242.196-.438.438-.438zM5.688 7c.242 0 .438.196.438.438v6.125a.438.438 0 11-.876 0V7.438c0-.242.196-.438.438-.438zM9.188 7.875c.242 0 .438.196.438.438v5.25a.438.438 0 11-.876 0v-5.25c0-.242.196-.438.438-.438zM12.688 0c.242 0 .438.196.438.438v2.625a.438.438 0 11-.876 0V.438c0-.242.196-.438.438-.438z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.063 0h2.625a.438.438 0 110 .876h-2.625a.438.438 0 110-.876z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.202 4.304L11.94.566a.438.438 0 11.619.619L8.621 5.123a.436.436 0 01-.463.1l-3.253-1.22-3.74 3.325a.438.438 0 01-.582-.654l3.938-3.5a.437.437 0 01.444-.083l3.236 1.214z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Trend);
var _default = ForwardRef;
exports["default"] = _default;