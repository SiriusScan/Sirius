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

function Registered(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.607 12.554c0-1.036-.357-1.768-1.071-2.161-.357-.196-.857-.321-2.089-.321h-2.196v5.018h2.893c1.571 0 2.464-.929 2.464-2.536zm.929 5.089l3.661 6.661a.558.558 0 01-.018.554.541.541 0 01-.482.286h-2.714a.533.533 0 01-.5-.304l-3.464-6.518h-2.768v6.25c0 .321-.25.571-.571.571h-2.393a.564.564 0 01-.571-.571V7.429c0-.321.25-.571.571-.571h5.25c1.875 0 2.696.161 3.393.429 2.018.75 3.268 2.732 3.268 5.161 0 2.196-1.089 4.054-2.821 4.911.054.089.107.179.161.286zM16 2.857C8.75 2.857 2.857 8.75 2.857 16S8.75 29.143 16 29.143 29.143 23.25 29.143 16 23.25 2.857 16 2.857zM32 16c0 8.839-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0s16 7.161 16 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Registered);
var _default = ForwardRef;
exports["default"] = _default;