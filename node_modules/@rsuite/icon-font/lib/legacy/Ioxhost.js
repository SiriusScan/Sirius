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

function Ioxhost(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.125 14.857c0 .839-.679 1.536-1.536 1.536H12.053a1.536 1.536 0 110-3.072h12.536c.857 0 1.536.696 1.536 1.536zm3.821 0c0-1.054-.143-2.054-.411-3.036H11.999a1.521 1.521 0 01-1.536-1.518c0-.857.679-1.536 1.536-1.536h16.214c-2.054-3.339-5.732-5.554-9.911-5.554-6.429 0-11.661 5.214-11.661 11.643 0 1.054.143 2.054.411 3.036h17.536c.857 0 1.536.679 1.536 1.518 0 .857-.679 1.536-1.536 1.536H8.374a11.634 11.634 0 009.929 5.554c6.411 0 11.643-5.214 11.643-11.643zm6.625-4.553c0 .839-.679 1.518-1.536 1.518h-2.339c.196.982.304 2 .304 3.036 0 8.107-6.589 14.714-14.696 14.714-5.946 0-11.071-3.536-13.393-8.625H1.536A1.525 1.525 0 010 19.411c0-.839.679-1.518 1.536-1.518h2.357c-.196-.982-.304-2-.304-3.036C3.589 6.75 10.178.143 18.303.143c5.929 0 11.054 3.536 13.375 8.625h3.357c.857 0 1.536.679 1.536 1.536z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Ioxhost);
var _default = ForwardRef;
exports["default"] = _default;