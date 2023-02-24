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

function Leaf(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 12.571c0-.625-.518-1.143-1.143-1.143-6.321 0-10.393 2.643-14.518 7.196-.214.232-.339.482-.339.804 0 .625.518 1.143 1.143 1.143.321 0 .571-.125.804-.339.875-.786 1.661-1.643 2.518-2.446 3.232-2.911 6-4.071 10.393-4.071.625 0 1.143-.518 1.143-1.143zM32 9.036c0 1.143-.125 2.304-.357 3.446-1.143 5.554-4.714 9.161-9.679 11.625-2.411 1.214-5.107 1.929-7.821 1.929-1.714 0-3.482-.286-5.107-.839-.857-.286-2.571-1.411-3.286-1.411-.893 0-1.964 3.643-3.518 3.643-1.125 0-1.464-.554-1.946-1.375C.125 25.75 0 25.643 0 25.268c0-1.857 3.536-3.304 3.536-4.339 0-.161-.464-1.107-.536-1.464a10.728 10.728 0 01-.161-1.857c0-5.679 4.518-9.732 9.589-11.411 3.661-1.214 11.446.196 13.929-2.161.982-.911 1.464-1.75 2.964-1.75 2.018 0 2.679 5.232 2.679 6.75z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Leaf);
var _default = ForwardRef;
exports["default"] = _default;