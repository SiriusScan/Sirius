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

function PiedPiperPp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.679 18.214c0 1.518-1.036 2.75-2.304 2.75-.518 0-.929-.089-1.25-.268V15.75c.321-.196.732-.304 1.25-.304 1.268 0 2.304 1.232 2.304 2.768zm-6.125-7.643c0 1.536-1.036 2.768-2.304 2.768-.518 0-.929-.089-1.25-.268V8.125c.321-.196.732-.304 1.25-.304 1.268 0 2.304 1.232 2.304 2.75zm10.035 7.697c0-3.196-2.411-5.786-5.375-5.786-.232 0-.464.018-.696.054a5.926 5.926 0 01-1.393 2.429c-1 1.089-2.339 1.732-3.768 1.804v11.357l3.768-.732v-3.679c.625.232 1.321.339 2.089.339 2.964 0 5.375-2.589 5.375-5.786zm-6.125-7.625c0-3.196-2.411-5.786-5.393-5.786a5.38 5.38 0 00-2.518.643H5.232v15L9 19.768v-3.679a6.382 6.382 0 002.071.339c2.982 0 5.393-2.589 5.393-5.786zm10.965-3.214v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PiedPiperPp);
var _default = ForwardRef;
exports["default"] = _default;