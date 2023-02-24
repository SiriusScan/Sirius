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

function Phone(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 22.143c0 .643-.286 1.893-.554 2.482-.375.875-1.375 1.446-2.179 1.893-1.054.571-2.125.911-3.321.911-1.661 0-3.161-.679-4.679-1.232a16.714 16.714 0 01-3.125-1.482c-3.036-1.875-6.696-5.536-8.571-8.571a16.714 16.714 0 01-1.482-3.125C.678 11.501 0 10.001 0 8.34c0-1.196.339-2.268.911-3.321.446-.804 1.018-1.804 1.893-2.179.589-.268 1.839-.554 2.482-.554.125 0 .25 0 .375.054.375.125.768 1 .946 1.357.571 1.018 1.125 2.054 1.714 3.054.286.464.821 1.036.821 1.589 0 1.089-3.232 2.679-3.232 3.643 0 .482.446 1.107.696 1.536 1.804 3.25 4.054 5.5 7.304 7.304.429.25 1.054.696 1.536.696.964 0 2.554-3.232 3.643-3.232.554 0 1.125.536 1.589.821 1 .589 2.036 1.143 3.054 1.714.357.179 1.232.571 1.357.946.054.125.054.25.054.375z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Phone);
var _default = ForwardRef;
exports["default"] = _default;