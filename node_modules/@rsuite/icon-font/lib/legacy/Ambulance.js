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

function Ambulance(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 35 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 25.143c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zM4.571 16h6.857v-4.571H8.607a1.07 1.07 0 00-.393.161l-3.482 3.482a1.505 1.505 0 00-.161.393v.536zm22.858 9.143c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm2.285-12V9.714a.564.564 0 00-.571-.571h-4v-4a.564.564 0 00-.571-.571h-3.429a.564.564 0 00-.571.571v4h-4a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h4v4c0 .321.25.571.571.571h3.429c.321 0 .571-.25.571-.571v-4h4c.321 0 .571-.25.571-.571zm4.572-9.714V24c0 .625-.518 1.143-1.143 1.143h-3.429a4.568 4.568 0 01-4.571 4.571 4.58 4.58 0 01-4.571-4.571h-6.857c0 2.518-2.036 4.571-4.571 4.571s-4.571-2.054-4.571-4.571H2.287c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143v-7.429c0-.625.357-1.5.804-1.946l3.536-3.536c.446-.446 1.321-.804 1.946-.804h2.857V3.428c0-.625.518-1.143 1.143-1.143h20.571c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Ambulance);
var _default = ForwardRef;
exports["default"] = _default;