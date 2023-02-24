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

function Wait(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M2.5 0h11a.5.5 0 010 1h-11a.5.5 0 010-1zM2.5 15h11a.5.5 0 010 1h-11a.5.5 0 010-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 1v3c0 .944.445 1.833 1.2 2.4l1.2.9a.999.999 0 001.2 0l1.2-.9A3.002 3.002 0 0011 4V1H5zM4 0h8v4a4 4 0 01-1.6 3.2l-1.2.9a2.001 2.001 0 01-2.4 0l-1.2-.9A4 4 0 014 4V0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15.002h6v-2.343c0-.796-.316-1.559-.879-2.121L8.707 9.124a.999.999 0 00-1.414 0l-1.414 1.414A3 3 0 005 12.659v2.343zm-1 1v-3.343c0-1.061.421-2.078 1.172-2.828l1.414-1.414a2 2 0 012.828 0l1.414 1.414A4.001 4.001 0 0112 12.659v3.343H4zM4.5 3h7a.5.5 0 010 1h-7a.5.5 0 010-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.5 13h4a.5.5 0 010 1h-4a.5.5 0 010-1zM10.5 13h1a.5.5 0 010 1h-1a.5.5 0 010-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Wait);
var _default = ForwardRef;
exports["default"] = _default;