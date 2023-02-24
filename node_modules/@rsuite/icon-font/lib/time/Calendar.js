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

function Calendar(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.5 7a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5zM7.5 7a.5.5 0 01.5.5v5a.5.5 0 01-1 0v-5a.5.5 0 01.5-.5zM10.5 7a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M1 8h10.5a.5.5 0 010 1H1V8zm0 3h7.5a.5.5 0 010 1H1v-1zM1 5h14v1H1V5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.5 1a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zM11.5 1a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zM14.5 11a.5.5 0 01.492.41l.008.09v1a2.501 2.501 0 01-2.336 2.495L12.5 15h-3a.5.5 0 01-.09-.992L9.5 14h3a1.5 1.5 0 001.493-1.356L14 12.5v-1a.5.5 0 01.5-.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13 3a2 2 0 012 2v3c0 2-2 3-4 3 .667 1.333.333 2.667-1 4H3a2 2 0 01-2-2V5a2 2 0 012-2h10zm.117 1.007L13 4H3a1 1 0 00-.993.883L2 5v8a1 1 0 00.883.993L3 14h6.566l.031-.033c.738-.856.9-1.608.575-2.375l-.067-.144a1 1 0 01.894-1.447c1.692 0 2.9-.76 2.994-1.861l.006-.139v-3a1 1 0 00-.883-.993z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Calendar);
var _default = ForwardRef;
exports["default"] = _default;