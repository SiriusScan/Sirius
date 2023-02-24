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

function Reddit(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M19.554 20.839c.161.161.161.411 0 .554C18.536 22.411 16.572 22.5 16 22.5s-2.536-.089-3.554-1.107c-.161-.143-.161-.393 0-.554a.388.388 0 01.536 0c.643.661 2.036.875 3.018.875s2.357-.214 3.018-.875a.388.388 0 01.536 0zm-5.483-3.232c0 .875-.714 1.589-1.589 1.589a1.596 1.596 0 01-1.607-1.589A1.6 1.6 0 0112.482 16c.875 0 1.589.714 1.589 1.607zm7.054 0c0 .875-.714 1.589-1.607 1.589a1.592 1.592 0 01-1.589-1.589c0-.893.714-1.607 1.589-1.607a1.6 1.6 0 011.607 1.607zm4.482-2.143a2.133 2.133 0 00-2.143-2.125c-.607 0-1.143.25-1.536.643-1.446-1-3.393-1.643-5.554-1.714l1.125-5.054 3.571.804c0 .875.714 1.589 1.589 1.589.893 0 1.607-.732 1.607-1.607s-.714-1.607-1.607-1.607c-.625 0-1.161.375-1.429.893l-3.946-.875c-.196-.054-.393.089-.446.286l-1.232 5.571c-2.143.089-4.071.732-5.518 1.732a2.142 2.142 0 00-1.554-.661 2.133 2.133 0 00-2.143 2.125c0 .857.5 1.571 1.214 1.929a4.663 4.663 0 00-.107 1c0 3.393 3.821 6.143 8.518 6.143 4.714 0 8.536-2.75 8.536-6.143 0-.339-.036-.696-.125-1.018a2.145 2.145 0 001.179-1.911zM32 16c0 8.839-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0s16 7.161 16 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Reddit);
var _default = ForwardRef;
exports["default"] = _default;