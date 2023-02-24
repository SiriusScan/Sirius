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

function Setting(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.813 8.75a1.313 1.313 0 110-2.626 1.313 1.313 0 010 2.626zm0-.875a.438.438 0 100-.876.438.438 0 000 .876zM9.188 5.25a1.313 1.313 0 110-2.626 1.313 1.313 0 010 2.626zm0-.875a.438.438 0 100-.876.438.438 0 000 .876zM4.813 2.625c.242 0 .438.196.438.438v1.75a.438.438 0 11-.876 0v-1.75c0-.242.196-.438.438-.438zM4.813 9.625c.242 0 .438.196.438.438v.875a.438.438 0 11-.876 0v-.875c0-.242.196-.438.438-.438zM9.188 6.125c.242 0 .438.196.438.438v4.375a.438.438 0 11-.876 0V6.563c0-.242.196-.438.438-.438z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12.25 13.125a.875.875 0 00.875-.875V1.75a.875.875 0 00-.875-.875H1.75a.875.875 0 00-.875.875v10.5c0 .483.392.875.875.875h10.5zm0 .875H1.75A1.75 1.75 0 010 12.25V1.75C0 .784.784 0 1.75 0h10.5C13.216 0 14 .784 14 1.75v10.5A1.75 1.75 0 0112.25 14z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Setting);
var _default = ForwardRef;
exports["default"] = _default;