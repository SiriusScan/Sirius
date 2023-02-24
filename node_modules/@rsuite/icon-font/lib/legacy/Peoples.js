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

function Peoples(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M7 4.375A1.75 1.75 0 106.999.874 1.75 1.75 0 007 4.375zm0 .875A2.625 2.625 0 117 0a2.625 2.625 0 010 5.25zM11.375 6.125a.875.875 0 100-1.75.875.875 0 000 1.75zm0 .875a1.75 1.75 0 11.001-3.501A1.75 1.75 0 0111.375 7zM2.625 6.125a.875.875 0 100-1.75.875.875 0 000 1.75zm0 .875a1.75 1.75 0 11.001-3.501A1.75 1.75 0 012.625 7zM7 7a2.625 2.625 0 00-2.625 2.625v3.5h5.25v-3.5A2.625 2.625 0 007 7zm0-.875a3.5 3.5 0 013.5 3.5v3.5a.875.875 0 01-.875.875h-5.25a.875.875 0 01-.875-.875v-3.5a3.5 3.5 0 013.5-3.5zM11.375 12.25a1.75 1.75 0 000-3.5v-.875a2.625 2.625 0 110 5.25v-.875zm0 0a1.75 1.75 0 000-3.5v-.875a2.625 2.625 0 110 5.25v-.875zM2.625 12.25v.875a2.625 2.625 0 110-5.25v.875a1.75 1.75 0 000 3.5zm0 0v.875a2.625 2.625 0 110-5.25v.875a1.75 1.75 0 000 3.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Peoples);
var _default = ForwardRef;
exports["default"] = _default;