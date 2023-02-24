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

function Coincide(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M32 10.434C32 4.727 27.355.082 21.648.082c-3.001 0-5.806 1.319-7.787 3.616C6.195 3.835 0 10.103 0 17.801 0 25.586 6.334 31.92 14.117 31.92c7.559 0 13.776-6.034 14.085-13.538 2.414-1.984 3.799-4.85 3.799-7.947zM21.648 1.963c4.672 0 8.471 3.799 8.471 8.471 0 2.023-.72 3.929-2.014 5.445-.85-6.117-5.669-11.033-11.758-12.011a8.338 8.338 0 015.301-1.904zm-7.531 28.074c-6.747 0-12.235-5.488-12.235-12.235 0-6.149 4.558-11.253 10.59-12.103a10.116 10.116 0 00-1.177 4.736c0 5.707 4.645 10.352 10.352 10.352 1.586 0 3.131-.37 4.551-1.081-.919 5.838-6.005 10.331-12.08 10.331z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Coincide);
var _default = ForwardRef;
exports["default"] = _default;