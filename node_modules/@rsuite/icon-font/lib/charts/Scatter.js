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

function Scatter(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.5 2a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm0 1a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm-9 10a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 012.5 13zm0 1a.5.5 0 100 1 .5.5 0 000-1zm11-3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm0 1a1.5 1.5 0 10.001 3.001A1.5 1.5 0 0013.5 11.5zM4 6a2 2 0 11.001 3.999A2 2 0 014 6zm0 1a1 1 0 100 2 1 1 0 000-2zm3.5 4a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 017.5 11zm0 1a.5.5 0 100 1 .5.5 0 000-1zm-6-10a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 011.5 2zm0 1a.5.5 0 100 1 .5.5 0 000-1zm5-3a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 016.5 0zm0 1a.5.5 0 100 1 .5.5 0 000-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Scatter);
var _default = ForwardRef;
exports["default"] = _default;