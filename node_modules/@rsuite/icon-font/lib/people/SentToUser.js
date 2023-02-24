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

function SentToUser(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.902 7.51a.5.5 0 01.579.627l-.028.075-3.5 7.5a.5.5 0 01-.711.217l-.072-.052-2.138-1.871-1.157 1.324a.5.5 0 01-.869-.24l-.007-.089v-2.76l-2.312-1.85a.5.5 0 01.123-.854l.091-.027 10-2zm-.774 1.173l-7.979 1.596 1.461 1.168 3.252-.928c.423-.121.755.31.602.671l-.037.071-.051.068-1.685 1.924 1.637 1.432 2.8-6.002zm-4.621 3.263l-.987.282.42.366.567-.648zM11 0a3 3 0 110 6 3 3 0 010-6zm0 1a2 2 0 10-.001 3.999A2 2 0 0011 1zM5 2a2 2 0 11.001 3.999A2 2 0 015 2zm0 1a1 1 0 100 2 1 1 0 000-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 5a.5.5 0 010 1c-1.156 0-2 .723-2 1.5a.5.5 0 01-1 0C2 6.134 3.323 5 5 5zm6 0c2.886 0 4.897 2.25 4.996 5.266L16 10.5v2a1.5 1.5 0 01-1.356 1.493L14.5 14H12a.5.5 0 01-.09-.992L12 13h2.5a.5.5 0 00.492-.41L15 12.5v-2C15 7.889 13.372 6 11 6c-1.059 0-1.971.365-2.665 1.035a.5.5 0 11-.694-.72c.882-.851 2.043-1.316 3.36-1.316z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SentToUser);
var _default = ForwardRef;
exports["default"] = _default;