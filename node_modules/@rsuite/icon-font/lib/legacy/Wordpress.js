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

function Wordpress(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M2.268 16c0-1.982.429-3.875 1.196-5.589l6.554 17.946C5.429 26.125 2.268 21.428 2.268 16zm23-.696c0 1.179-.482 2.536-1.054 4.446l-1.357 4.571-4.964-14.75s.821-.054 1.571-.143c.732-.089.643-1.179-.089-1.125-2.232.161-3.661.179-3.661.179s-1.339-.018-3.607-.179c-.75-.054-.839 1.071-.089 1.125.696.071 1.429.143 1.429.143l2.143 5.857-3 9-5-14.857s.821-.054 1.571-.143c.732-.089.643-1.179-.089-1.125a67.488 67.488 0 01-3.661.179c-.25 0-.554-.018-.875-.018A13.676 13.676 0 0116 2.268c3.571 0 6.821 1.375 9.268 3.607h-.179c-1.339 0-2.304 1.161-2.304 2.429 0 1.125.661 2.071 1.357 3.214.536.911 1.125 2.089 1.125 3.786zm-9.036 1.892l4.232 11.554a.677.677 0 00.089.196c-1.429.5-2.946.786-4.554.786a13.3 13.3 0 01-3.875-.571zm11.804-7.785A13.698 13.698 0 0129.732 16c0 5.071-2.75 9.482-6.839 11.857l4.196-12.107c.696-2 1.054-3.536 1.054-4.929 0-.5-.036-.964-.107-1.411zM16 0c8.821 0 16 7.179 16 16s-7.179 16-16 16S0 24.821 0 16 7.179 0 16 0zm0 31.268c8.411 0 15.268-6.857 15.268-15.268S24.411.732 16 .732.732 7.589.732 16 7.589 31.268 16 31.268z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Wordpress);
var _default = ForwardRef;
exports["default"] = _default;