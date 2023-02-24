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

function Italic(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 18 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M0 29.679l.304-1.518c1.143-.357 2.375-.5 3.446-1.054.411-.518.607-1.179.732-1.804.232-1.214 4.125-18.732 4.071-20.161v-.446c-.982-.536-2.179-.393-3.25-.571l.339-1.839c2.304.107 4.643.286 6.964.286 1.893 0 3.786-.179 5.679-.286a11.878 11.878 0 01-.339 1.589c-1.232.429-2.536.625-3.75 1.107-.393.964-.482 2.018-.661 3.036-.857 4.625-2 9.25-2.946 13.839-.179.857-1.054 4.411-.982 5.161l.018.321c1.089.25 2.196.375 3.304.554a10.142 10.142 0 01-.286 1.768c-.393 0-.768.054-1.161.054-1.018 0-2.071-.339-3.089-.357-1.232-.018-2.464-.036-3.679-.036-1.589 0-3.143.268-4.714.357z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Italic);
var _default = ForwardRef;
exports["default"] = _default;