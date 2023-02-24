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

function Try(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 21 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.571 14.857c0 6.929-5.643 12.571-12.571 12.571H5.143a.564.564 0 01-.571-.571V15.946L.733 17.125c-.054.018-.107.018-.161.018a.59.59 0 01-.339-.107.592.592 0 01-.232-.464v-2.286c0-.25.161-.464.411-.554l4.161-1.268v-1.661L.734 11.982C.68 12 .627 12 .573 12a.59.59 0 01-.339-.107.592.592 0 01-.232-.464V9.143c0-.25.161-.464.411-.554l4.161-1.268V2.857c0-.321.25-.571.571-.571h2.857c.321 0 .571.25.571.571v3.232l6.696-2.071c.161-.054.357-.018.5.089s.232.286.232.464v2.286c0 .25-.161.464-.411.554L8.572 9.572v1.661l6.696-2.071c.161-.054.357-.018.5.089s.232.286.232.464v2.286c0 .25-.161.464-.411.554l-7.018 2.161v8.696c4.464-.304 8-4.018 8-8.554 0-.321.25-.571.571-.571h2.857c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Try);
var _default = ForwardRef;
exports["default"] = _default;