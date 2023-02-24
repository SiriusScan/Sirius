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

function UserInfo(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.586 16a1 1 0 00.608-.206l.099-.087L14 12l-.707-.707L9.586 15H3a1 1 0 01-.993-.883L2 14V2a1 1 0 01.883-.993L3 1h9a1 1 0 01.993.883L13 2v6.5a.5.5 0 00.992.09L14 8.5V2A2.001 2.001 0 0012.149.005L12 0H3a2.001 2.001 0 00-1.995 1.851L1 2v12c0 1.054.816 1.918 1.851 1.995L3 16h6.586z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 16a.5.5 0 00.5-.5v-4a.5.5 0 00-1 0v4a.5.5 0 00.5.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 12H14a1 1 0 00-1-1H9.5a.5.5 0 000 1zM7.5 7a1.5 1.5 0 10-.001-3.001A1.5 1.5 0 007.5 7zm0 1a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 10c0-1.933 2-3 3.5-3 1.448 0 3.363.932 3.493 2.797L11 10h-1c0-1.139-1.184-2-2.5-2-1.227 0-2.398.828-2.494 1.864L5 10v1.5a.5.5 0 01-1 0V10z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserInfo);
var _default = ForwardRef;
exports["default"] = _default;