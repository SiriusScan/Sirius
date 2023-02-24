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

function SearchPeoples(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.125 11.375A5.25 5.25 0 106.124.874a5.25 5.25 0 00.001 10.501zm0 .875a6.125 6.125 0 110-12.25 6.125 6.125 0 010 12.25z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.125 7a1.75 1.75 0 10-.001-3.501A1.75 1.75 0 006.125 7zm0 .875a2.625 2.625 0 110-5.25 2.625 2.625 0 010 5.25z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.75 10.938v-.429a2.625 2.625 0 00-2.625-2.634A2.632 2.632 0 003.5 10.509v.429h-.875v-.429A3.507 3.507 0 016.125 7a3.5 3.5 0 013.5 3.509v.429H8.75zm0 0v-.429a2.625 2.625 0 00-2.625-2.634A2.632 2.632 0 003.5 10.509v.429h-.875v-.429A3.507 3.507 0 016.125 7a3.5 3.5 0 013.5 3.509v.429H8.75zM13.872 13.253a.438.438 0 11-.619.619l-3.063-3.063a.438.438 0 11.619-.619l3.063 3.063z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SearchPeoples);
var _default = ForwardRef;
exports["default"] = _default;