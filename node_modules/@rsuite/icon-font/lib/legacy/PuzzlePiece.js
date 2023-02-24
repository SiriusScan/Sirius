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

function PuzzlePiece(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.714 19.607c0 1.839-1.054 3.375-3 3.375C24.535 22.982 23.964 21 22 21c-1.429 0-1.964.893-1.964 2.214 0 1.393.571 2.732.554 4.107v.089c-.196 0-.393 0-.589.018-1.839.179-3.696.536-5.554.536-1.268 0-2.589-.5-2.589-1.964 0-1.964 1.982-2.536 1.982-4.714 0-1.946-1.536-3-3.375-3-1.875 0-3.607 1.036-3.607 3.089 0 2.268 1.732 3.25 1.732 4.482 0 .625-.393 1.179-.821 1.589-.554.518-1.339.625-2.089.625-1.464 0-2.929-.196-4.375-.429-.321-.054-.661-.089-.982-.143l-.232-.036c-.036-.018-.089-.018-.089-.036V9.141c.071.054 1.125.179 1.304.214 1.446.232 2.911.429 4.375.429.75 0 1.536-.107 2.089-.625.429-.411.821-.964.821-1.589 0-1.232-1.732-2.214-1.732-4.482 0-2.054 1.732-3.089 3.625-3.089 1.821 0 3.357 1.054 3.357 3 0 2.179-1.982 2.75-1.982 4.714 0 1.464 1.321 1.964 2.589 1.964 2.054 0 4.089-.464 6.125-.571v.036c-.054.071-.179 1.125-.214 1.304-.232 1.446-.429 2.911-.429 4.375 0 .75.107 1.536.625 2.089.411.429.964.821 1.589.821 1.232 0 2.214-1.732 4.482-1.732 2.054 0 3.089 1.732 3.089 3.607z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PuzzlePiece);
var _default = ForwardRef;
exports["default"] = _default;