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

function FileUpload(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.586 1l3.707 3.707L14 4l-4-4H3a2 2 0 00-2 2v12a2 2 0 002 2h9a2 2 0 002-2V7h-1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1h6.586z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 0a.5.5 0 01.5.5v4a.5.5 0 01-1 0v-4a.5.5 0 01.5-.5zM7 6.5a.5.5 0 011 0v5a.5.5 0 01-1 0v-5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.854 6.854l-2.5 2.5a.5.5 0 01-.707-.707l2.5-2.5a.5.5 0 01.707.707z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.146 6.854a.5.5 0 01.707-.707l2.5 2.5a.5.5 0 01-.707.707l-2.5-2.5zM9.5 4H14v1H9.5a.5.5 0 010-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FileUpload);
var _default = ForwardRef;
exports["default"] = _default;