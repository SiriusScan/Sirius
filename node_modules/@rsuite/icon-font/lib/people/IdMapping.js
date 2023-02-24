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

function IdMapping(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M2 15h5.5a.5.5 0 010 1H2a1 1 0 01-1-1v-4.5a4.5 4.5 0 012.582-4.072A3.5 3.5 0 015.5 0a.5.5 0 010 1 2.5 2.5 0 100 5 .5.5 0 010 1A3.5 3.5 0 002 10.5V15zM7.5 6h3a.5.5 0 010 1h-3a.5.5 0 010-1zM9.5 8h4a.5.5 0 010 1h-4a.5.5 0 010-1zM10.5 10h2a.5.5 0 010 1h-2a.5.5 0 010-1zM10.5 12h1a.5.5 0 010 1h-1a.5.5 0 010-1zM10.5 14h4a.5.5 0 010 1h-4a.5.5 0 010-1zM9.5 4h2a.5.5 0 010 1h-2a.5.5 0 010-1zM9.5 2h4a.5.5 0 010 1h-4a.5.5 0 010-1zM7.5 0h4a.5.5 0 010 1h-4a.5.5 0 010-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(IdMapping);
var _default = ForwardRef;
exports["default"] = _default;