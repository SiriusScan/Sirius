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

function HeartO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.714 10.643c0-5.018-3.393-6.071-6.25-6.071-2.661 0-5.661 2.875-6.589 3.982-.429.518-1.321.518-1.75 0-.929-1.107-3.929-3.982-6.589-3.982-2.857 0-6.25 1.054-6.25 6.071 0 3.268 3.304 6.304 3.339 6.339l10.375 10L26.357 17c.054-.054 3.357-3.089 3.357-6.357zm2.286 0c0 4.286-3.929 7.875-4.089 8.036L16.786 29.393c-.214.214-.5.321-.786.321s-.571-.107-.786-.321L4.071 18.643c-.143-.125-4.071-3.714-4.071-8 0-5.232 3.196-8.357 8.536-8.357 3.125 0 6.054 2.464 7.464 3.857 1.411-1.393 4.339-3.857 7.464-3.857 5.339 0 8.536 3.125 8.536 8.357z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HeartO);
var _default = ForwardRef;
exports["default"] = _default;