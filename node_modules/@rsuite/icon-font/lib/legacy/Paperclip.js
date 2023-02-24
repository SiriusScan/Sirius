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

function Paperclip(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.071 24.732c0 2.786-2.125 4.911-4.911 4.911-1.571 0-3.089-.679-4.196-1.786L2.089 14C.821 12.714.071 10.964.071 9.161c0-3.786 2.982-6.804 6.768-6.804 1.821 0 3.571.732 4.875 2.018l10.804 10.821c.107.107.179.25.179.393 0 .375-1 1.375-1.375 1.375a.578.578 0 01-.411-.179L10.09 5.946c-.857-.839-2.018-1.375-3.232-1.375-2.536 0-4.5 2.054-4.5 4.571 0 1.214.5 2.375 1.357 3.232l13.857 13.875c.679.679 1.625 1.125 2.589 1.125 1.518 0 2.643-1.125 2.643-2.643 0-.982-.446-1.911-1.125-2.589L11.304 11.767a1.594 1.594 0 00-1.071-.429c-.679 0-1.196.5-1.196 1.196 0 .393.179.768.446 1.054l7.321 7.321c.107.107.179.25.179.393 0 .375-1.018 1.393-1.393 1.393a.57.57 0 01-.393-.179l-7.321-7.321a3.762 3.762 0 01-1.125-2.661c0-1.964 1.536-3.5 3.5-3.5 1 0 1.964.411 2.661 1.125l10.375 10.375c1.125 1.107 1.786 2.625 1.786 4.196z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Paperclip);
var _default = ForwardRef;
exports["default"] = _default;