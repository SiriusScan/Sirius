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

function LogoSurvey(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M28.985 3.595H3.015C1.353 3.595 0 4.985 0 6.688v18.624c0 1.705 1.353 3.093 3.015 3.093h25.966c1.664 0 3.017-1.387 3.017-3.093V6.688c.002-1.703-1.351-3.093-3.013-3.093zm0 21.95H3.015a.234.234 0 01-.229-.233V9.09h26.421v16.222c0 .13-.098.233-.222.233z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20.809 12.544v.002h-9.616v9.614h9.616v-2.485l-1.246 1.246v-.005h-7.127v-7.129h7.127z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25.179 12.306l-.569-.567a.807.807 0 00-1.138 0l-5.687 5.687-2.841-2.843a.803.803 0 00-1.138 0l-.569.569a.8.8 0 000 1.136l3.979 3.982c.027.025.062.039.091.059a.795.795 0 001.047-.059l6.823-6.825a.805.805 0 00.002-1.138z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LogoSurvey);
var _default = ForwardRef;
exports["default"] = _default;