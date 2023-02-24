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

function LogoDmp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M28.983 3.595H3.017C1.353 3.595 0 4.982 0 6.688v18.624c0 1.707 1.353 3.093 3.017 3.093h25.966c1.666 0 3.017-1.385 3.017-3.093V6.69c-.002-1.707-1.353-3.095-3.017-3.095zm.226 21.717a.234.234 0 01-.229.235H3.017a.232.232 0 01-.229-.235V9.09h26.423v16.222h-.002z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.858 23.529c.773 0 1.394-.64 1.394-1.429v-4.818c0-.791-.626-1.431-1.394-1.431s-1.394.64-1.394 1.431V22.1c0 .789.624 1.429 1.394 1.429zM13.282 23.529c.773 0 1.397-.64 1.397-1.429v-9.534c0-.789-.626-1.429-1.397-1.429s-1.392.64-1.392 1.429V22.1c0 .789.624 1.429 1.392 1.429zM18.713 23.529c.773 0 1.392-.64 1.392-1.429v-8.297c0-.789-.624-1.429-1.392-1.429-.77 0-1.394.64-1.394 1.429V22.1c0 .789.624 1.429 1.394 1.429zM24.139 23.529c.77 0 1.394-.64 1.394-1.429v-4.203c0-.791-.626-1.431-1.394-1.431-.773 0-1.394.64-1.394 1.431V22.1c-.002.789.624 1.429 1.394 1.429z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LogoDmp);
var _default = ForwardRef;
exports["default"] = _default;