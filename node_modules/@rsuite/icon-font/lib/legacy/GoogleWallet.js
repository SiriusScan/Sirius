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

function GoogleWallet(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M7.875 12c.357 0 .714.179.929.464 3.125 4.268 5.304 8.839 6.464 13.821H7.304C5.875 21.321 3.768 16.785.75 12.91c-.286-.375 0-.911.464-.911h6.661zm9.982 6.375a54.343 54.343 0 01-2.232 7.018c-.946-3.732-2.464-7.232-4.571-10.607.464-2.589.732-5.25.786-8.018 2.518 4.054 4.518 7.911 6.018 11.607zm1.768-12.661C24.964 13.071 28.929 22.143 29.786 32h-8.054c-.589-9.536-4.982-18.571-9.875-26.286h7.768zM32 16c0 4.964-.679 10.179-1.804 14.5-.786-6.607-2.964-13.179-6.411-19.339A54.906 54.906 0 0021.892.732c-.089-.375.179-.732.554-.732h6.411c.5 0 .964.339 1.089.821C31.303 5.642 32 10.75 32 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(GoogleWallet);
var _default = ForwardRef;
exports["default"] = _default;