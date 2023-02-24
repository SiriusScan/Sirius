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

function Cut(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.143 16c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143S16 17.768 16 17.143 16.518 16 17.143 16zm5.357 1.143l9.054 7.107c.321.232.482.625.446 1a1.21 1.21 0 01-.625.911l-2.286 1.143a1.06 1.06 0 01-.518.125c-.196 0-.393-.054-.554-.143l-12.321-6.911-1.964 1.179a1.08 1.08 0 01-.214.089 4.71 4.71 0 01.179 1.732c-.161 1.839-1.393 3.589-3.357 4.839-1.518.964-3.268 1.5-4.946 1.5-1.607 0-2.964-.482-3.964-1.393a4.482 4.482 0 01-1.411-3.696c.161-1.821 1.393-3.589 3.339-4.839 1.518-.964 3.286-1.5 4.964-1.5 1 0 1.911.196 2.696.554.107-.161.232-.286.393-.393l2.179-1.304-2.179-1.304a1.363 1.363 0 01-.393-.393c-.786.357-1.696.554-2.696.554-1.679 0-3.446-.536-4.964-1.5C1.412 13.25.179 11.482.019 9.661A4.427 4.427 0 011.43 5.982c1-.929 2.357-1.411 3.964-1.411 1.679 0 3.429.536 4.946 1.5 1.964 1.232 3.196 3 3.357 4.839a4.686 4.686 0 01-.179 1.732c.071.018.143.054.214.089l1.964 1.179 12.321-6.911c.161-.089.357-.143.554-.143.179 0 .357.036.518.125l2.286 1.143c.339.179.571.518.625.911.036.375-.125.768-.446 1zM10.339 12.5c1.089-1 .411-2.804-1.518-4.018-1.089-.696-2.357-1.054-3.429-1.054-.821 0-1.554.214-2.018.643-1.089 1-.411 2.804 1.518 4.018 1.089.696 2.339 1.054 3.429 1.054.821 0 1.554-.214 2.018-.643zM8.821 25.804c1.929-1.214 2.607-3.018 1.518-4.018-.464-.429-1.196-.643-2.018-.643-1.089 0-2.339.357-3.429 1.054-1.929 1.214-2.607 3.018-1.518 4.018.464.429 1.196.643 2.018.643 1.071 0 2.339-.357 3.429-1.054zM12 14.857l1.714 1.036v-.196c0-.411.232-.786.589-1l.25-.143-1.411-.839-.464.464c-.143.143-.25.286-.393.411-.054.054-.089.071-.125.107zm4 4l1.714.571L30.857 9.142l-2.286-1.143-13.714 7.696v2.018L12 19.427l.161.143c.036.054.071.071.125.107.143.143.25.286.393.429l.464.464zm12.571 7.429l2.286-1.143-9.286-7.286-3.161 2.464c-.054.071-.143.089-.232.125z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Cut);
var _default = ForwardRef;
exports["default"] = _default;