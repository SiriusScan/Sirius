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

function Simplybuilt(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.411 18.429a4.831 4.831 0 00-4.839-4.839 4.828 4.828 0 00-4.821 4.839 4.824 4.824 0 004.821 4.821 4.828 4.828 0 004.839-4.821zm15.41-.018A4.824 4.824 0 0026 13.59a4.828 4.828 0 00-4.839 4.821A4.831 4.831 0 0026 23.25a4.828 4.828 0 004.821-4.839zm5.75-14.447v24.071a1.917 1.917 0 01-1.929 1.911H1.928a1.917 1.917 0 01-1.929-1.911V3.964c0-1.054.857-1.911 1.929-1.911h7.696c1.054 0 1.929.857 1.929 1.911v2.875h13.464V3.964c0-1.054.875-1.911 1.929-1.911h7.696c1.071 0 1.929.857 1.929 1.911z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Simplybuilt);
var _default = ForwardRef;
exports["default"] = _default;