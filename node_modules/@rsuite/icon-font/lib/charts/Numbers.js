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

function Numbers(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M1 2H.5a.5.5 0 010-1H1V.5a.5.5 0 011 0V16H1V2zm14 6a1 1 0 01.993.883L16 9v4.5l-.005.164a2.5 2.5 0 01-4.99 0L11 13.5v-2a.5.5 0 011 0v2l.007.144a1.5 1.5 0 002.986 0L15 13.5V8zm0-1v1h-2.5a.5.5 0 010-1H15zm-1.5-7a2.501 2.501 0 012.495 2.336L16 2.5V6a1 1 0 01-.883.993L15 7V2.5a1.5 1.5 0 00-2.993-.144L12 2.5v1a.5.5 0 01-1 0v-1A2.5 2.5 0 0113.5 0zM9 5.298c0 .505-.153.996-.436 1.41l-.112.152-2.685 3.357a3.498 3.498 0 00-.759 1.949L5 12.404v2.597h3.5a.5.5 0 010 1H4v-3.597c0-.937.292-1.848.833-2.608l.154-.203 2.685-3.357c.182-.228.294-.503.322-.792l.007-.145V2.501a1.5 1.5 0 00-2.993-.144l-.007.144v2a.5.5 0 01-1 0v-2a2.5 2.5 0 014.995-.164l.005.164v2.798z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Numbers);
var _default = ForwardRef;
exports["default"] = _default;