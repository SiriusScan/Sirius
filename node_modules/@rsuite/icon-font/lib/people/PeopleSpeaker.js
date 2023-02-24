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

function PeopleSpeaker(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9 8.618v2.764l5.01 2.505a.684.684 0 00.99-.612v-6.55a.684.684 0 00-.99-.612L9 8.618zM8 8l5.563-2.781a1.685 1.685 0 012.438 1.506v6.55a1.684 1.684 0 01-2.437 1.506L8.001 12V8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 11v3.5c0 .831.75 1.5 1.5 1.5s1.5-.669 1.5-1.5V12l-.949-.316A1.001 1.001 0 009 12v2.5c0 .243-.266.5-.5.5s-.5-.257-.5-.5v-3.167L7 11z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 9v2h2V9H6zm-.158-1H9v4H5.842A.842.842 0 015 11.158V8.842C5 8.377 5.377 8 5.842 8zM4.5 6a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm0 1a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15a.5.5 0 010 1H1a1 1 0 01-1-1v-4c0-3 2-5 5-5v1c-2.448 0-4 1.552-4 4v4h4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PeopleSpeaker);
var _default = ForwardRef;
exports["default"] = _default;