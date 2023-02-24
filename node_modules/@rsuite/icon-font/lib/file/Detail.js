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

function Detail(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.586 16a1 1 0 00.608-.206l.099-.087L14 12a1 1 0 00-1-1H9.5a.5.5 0 00-.5.5V15H3a1 1 0 01-.993-.883L2 14V2a1 1 0 01.883-.993L3 1h9a1 1 0 01.993.883L13 2v6.5a.5.5 0 00.992.09L14 8.5V2A2.001 2.001 0 0012.149.005L12 0H3a2.001 2.001 0 00-1.995 1.851L1 2v12c0 1.054.816 1.918 1.851 1.995L3 16h6.586zM10 14.585V12h2.585L10 14.585z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.5 11h3a.5.5 0 000-1h-3a.5.5 0 000 1zM4.5 13h3a.5.5 0 000-1h-3a.5.5 0 000 1zM10.5 8a.5.5 0 000-1H5v-.5a.498.498 0 00.353-.146l1.646-1.646 1.646 1.646a.5.5 0 00.707 0l2-2a.5.5 0 00-.707-.707L8.999 5.293 7.353 3.647a.5.5 0 00-.707 0L5 5.294V3.001a.5.5 0 00-1 0v5h6.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Detail);
var _default = ForwardRef;
exports["default"] = _default;