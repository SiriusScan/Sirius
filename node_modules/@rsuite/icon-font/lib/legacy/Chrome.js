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

function Chrome(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.946 0A15.89 15.89 0 0124 2.143a16.031 16.031 0 016.286 6.643l-13.25-.696c-3.75-.214-7.321 1.893-8.554 5.429L3.553 5.948C6.624 2.127 11.232.019 15.946.002zM2.607 7.232l6.018 11.839c1.696 3.339 5.286 5.375 9 4.679l-4.107 8.054C5.857 30.625 0 24 0 16c0-3.232.964-6.25 2.607-8.768zm28.322 3.018c2.804 7.214 0 15.607-6.929 19.607a15.962 15.962 0 01-8.893 2.125l7.232-11.125c2.054-3.161 2.018-7.286-.429-10.143zM16 10.607c2.982 0 5.393 2.411 5.393 5.393S18.982 21.393 16 21.393 10.607 18.982 10.607 16s2.411-5.393 5.393-5.393z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Chrome);
var _default = ForwardRef;
exports["default"] = _default;