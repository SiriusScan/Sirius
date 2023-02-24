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

function Xing(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.661 11.911s-.179.304-4.589 8.143c-.232.393-.536.821-1.161.821H.643c-.25 0-.446-.125-.554-.304s-.125-.411 0-.643l4.518-8c.018 0 .018 0 0-.018L1.732 6.928c-.125-.232-.143-.482-.018-.661.107-.179.321-.268.571-.268h4.268c.643 0 .964.429 1.179.804 2.911 5.089 2.929 5.107 2.929 5.107zM25.054.446c.125.179.125.429 0 .661l-9.429 16.679c-.018 0-.018.018 0 .018l6 10.982c.125.232.125.482.018.661-.125.179-.321.268-.571.268h-4.268c-.643 0-.982-.429-1.179-.804-6.054-11.089-6.054-11.107-6.054-11.107s.304-.536 9.482-16.821c.232-.411.5-.804 1.143-.804H24.5c.25 0 .446.089.554.268z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Xing);
var _default = ForwardRef;
exports["default"] = _default;