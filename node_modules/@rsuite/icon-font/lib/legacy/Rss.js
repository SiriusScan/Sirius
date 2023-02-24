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

function Rss(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 24a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zM16 26.196c.018.321-.089.625-.304.857-.214.25-.518.375-.839.375h-2.411a1.128 1.128 0 01-1.125-1.036A11.427 11.427 0 001.035 16.106a1.129 1.129 0 01-1.036-1.125V12.57c0-.321.125-.625.375-.839.196-.196.482-.304.768-.304h.089a16.035 16.035 0 0110.089 4.679 16.042 16.042 0 014.679 10.089zm9.143.036c.018.304-.089.607-.321.839-.214.232-.5.357-.821.357h-2.554a1.138 1.138 0 01-1.143-1.071c-.589-10.375-8.857-18.643-19.232-19.25A1.134 1.134 0 01.001 5.982V3.428c0-.321.125-.607.357-.821.214-.214.5-.321.786-.321h.054a25.14 25.14 0 0116.554 7.393 25.149 25.149 0 017.393 16.554z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Rss);
var _default = ForwardRef;
exports["default"] = _default;