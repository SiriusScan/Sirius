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

function Unvisible(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 8c-2.388 3.333-5.054 5-8 5-1.378 0-2.694-.365-3.95-1.094l.657-.777C5.767 11.713 6.864 12 8 12c2.419 0 4.662-1.303 6.753-4-1.066-1.374-2.17-2.386-3.318-3.048l.018.03a4 4 0 01-5.919 5.169l.647-.764a3 3 0 003.87-4.575l.994-1.175c1.767.765 3.418 2.219 4.954 4.364zM8 3a7.54 7.54 0 012.041.279l-.827.977a3 3 0 00-3.719 4.395l-.666.788A3.982 3.982 0 014 7.001c0-.749.206-1.449.563-2.048-1.146.662-2.251 1.674-3.317 3.048.844 1.089 1.713 1.95 2.608 2.59l-.648.765c-1.12-.815-2.189-1.934-3.207-3.355 2.388-3.333 5.054-5 8-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.823 1.118a.5.5 0 00-.64-.005l-.064.063-11 13a.5.5 0 00.699.71l.064-.063 11-13a.5.5 0 00-.059-.705z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Unvisible);
var _default = ForwardRef;
exports["default"] = _default;