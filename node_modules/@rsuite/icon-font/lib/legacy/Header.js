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

function Header(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M30.036 29.714c-1.571 0-3.161-.125-4.75-.125-1.571 0-3.143.125-4.714.125-.607 0-.893-.661-.893-1.179 0-1.589 1.786-.911 2.714-1.518.589-.375.589-1.875.589-2.5l-.018-6.982c0-.196 0-.375-.018-.554-.286-.089-.607-.071-.893-.071H9.999c-.304 0-.625-.018-.911.071-.018.179-.018.357-.018.554l-.018 6.625c0 .679 0 2.536.661 2.929.929.571 3.036-.232 3.036 1.375 0 .536-.25 1.25-.875 1.25-1.661 0-3.321-.125-4.964-.125-1.518 0-3.036.125-4.554.125-.589 0-.857-.679-.857-1.179 0-1.554 1.643-.911 2.518-1.518.571-.393.589-1.929.589-2.554l-.018-1.018V8.927c0-.857.125-3.607-.679-4.089-.893-.554-2.804.304-2.804-1.304 0-.518.232-1.25.857-1.25 1.643 0 3.304.125 4.946.125 1.5 0 3.018-.125 4.518-.125.643 0 .893.714.893 1.25 0 1.536-1.768.786-2.643 1.339-.625.375-.625 2.214-.625 2.857l.018 5.714c0 .196 0 .375.018.571.232.054.464.054.696.054h12.482c.214 0 .446 0 .679-.054.018-.196.018-.375.018-.571l.018-5.714c0-.661 0-2.482-.625-2.857-.893-.536-2.679.179-2.679-1.339 0-.536.25-1.25.893-1.25 1.571 0 3.143.125 4.714.125 1.536 0 3.071-.125 4.607-.125.643 0 .893.714.893 1.25 0 1.554-1.839.768-2.732 1.321-.607.393-.625 2.232-.625 2.875l.018 16.839c0 .589.036 2.143.607 2.5.911.571 2.839-.161 2.839 1.393 0 .518-.232 1.25-.857 1.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Header);
var _default = ForwardRef;
exports["default"] = _default;