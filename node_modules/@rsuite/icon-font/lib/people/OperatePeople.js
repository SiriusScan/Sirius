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

function OperatePeople(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8 8a2 2 0 10.001-3.999A2 2 0 008 8zm0 1a3 3 0 110-6 3 3 0 010 6z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 13a2 2 0 01-2-2V8c0-.597.262-1.134.677-1.5A1.996 1.996 0 010 5V2a2 2 0 012-2h4a2 2 0 012 2 .5.5 0 01-1 0 1 1 0 00-1-1H2a1 1 0 00-1 1v3a1 1 0 001 1h1a.5.5 0 010 1H2a1 1 0 00-1 1v3a1 1 0 001 1 .5.5 0 010 1zm12 0a.5.5 0 010-1 1 1 0 001-1V8a1 1 0 00-1-1h-1a.5.5 0 010-1h1a1 1 0 001-1V2a1 1 0 00-1-1h-4a1 1 0 00-1 1 .5.5 0 01-1 0 2 2 0 012-2h4a2 2 0 012 2v3c0 .597-.262 1.134-.677 1.5.415.366.677.903.677 1.5v3a2 2 0 01-2 2zM8 9a3 3 0 00-3 3v3h6v-3a3 3 0 00-3-3zm0-1a4 4 0 014 4v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3a4 4 0 014-4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(OperatePeople);
var _default = ForwardRef;
exports["default"] = _default;