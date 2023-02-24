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

function BehanceSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.286 2.286a5.145 5.145 0 015.143 5.143v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143zM8.911 8.839H2.286v14.054h6.821c2.554 0 4.946-1.214 4.946-4.071 0-1.768-.839-3.071-2.554-3.571 1.25-.607 1.911-1.518 1.911-2.929 0-2.804-2.089-3.482-4.5-3.482zm-.393 5.679H5.375v-3.286h2.911c1.107 0 2.125.304 2.125 1.607 0 1.196-.786 1.679-1.893 1.679zm.161 5.982H5.375v-3.875H8.75c1.357 0 2.214.589 2.214 2.018S9.946 20.5 8.678 20.5zm11.607.571c-1.643 0-2.5-.964-2.5-2.589h7.339c.018-.179.018-.357.018-.536 0-3-1.768-5.518-4.964-5.518-3.089 0-5.214 2.339-5.214 5.393 0 3.179 2 5.339 5.214 5.339 2.446 0 4.018-1.089 4.768-3.411h-2.464c-.268.857-1.357 1.321-2.196 1.321zm-.179-6.535c1.393 0 2.089.839 2.214 2.179h-4.536c.089-1.339.982-2.179 2.321-2.179zm-2.893-4.75h5.696v1.375h-5.696V9.786z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(BehanceSquare);
var _default = ForwardRef;
exports["default"] = _default;