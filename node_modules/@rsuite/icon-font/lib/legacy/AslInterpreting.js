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

function AslInterpreting(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.429 17.143a1.706 1.706 0 01-1.5-.982 2.287 2.287 0 00-2.071-1.304 2.279 2.279 0 00-2.286 2.286c0 .607.214 1.196.643 1.589l.179.143c.393.357.911.554 1.464.554.893 0 1.679-.5 2.071-1.304a1.706 1.706 0 011.5-.982zm10.142-2.286c0-.607-.214-1.196-.643-1.589l-.179-.143a2.164 2.164 0 00-1.464-.554c-.893 0-1.679.5-2.071 1.304a1.706 1.706 0 01-1.5.982 1.706 1.706 0 011.5.982 2.287 2.287 0 002.071 1.304 2.279 2.279 0 002.286-2.286zm-7.607-3.946a1.723 1.723 0 01-2.286.786 5.29 5.29 0 00-2.393-.554 5.24 5.24 0 00-1.768.304c.107 0 .232-.018.339-.018a5.749 5.749 0 015.161 3.268 1.715 1.715 0 01-.821 2.286 1.535 1.535 0 01-.696.161c.25 0 .482.054.696.161a1.715 1.715 0 01.821 2.286 5.747 5.747 0 01-5.161 3.268h-.107a10.975 10.975 0 00-.786-.071l-5.179-.482-4.268 2.143a1.11 1.11 0 01-.518.125c-.411 0-.821-.232-1.018-.625L.123 18.235a1.167 1.167 0 01.446-1.518l3.732-2.125 2.643-4.768A14.22 14.22 0 0112.069.395a1.705 1.705 0 012.411.232c.607.732.5 1.804-.232 2.411a11.443 11.443 0 00-2.089 2.286c1.393-.946 3-1.589 4.768-1.804a1.688 1.688 0 011.911 1.482 1.688 1.688 0 01-1.482 1.911 7.26 7.26 0 00-2.839.982 8.247 8.247 0 011.768-.179c1.357 0 2.679.304 3.893.893.857.429 1.214 1.446.786 2.304zm17.197-2.857l2.857 5.714a1.167 1.167 0 01-.446 1.518l-3.732 2.125-2.643 4.768a14.22 14.22 0 01-5.125 9.429 1.702 1.702 0 01-1.089.393c-.5 0-.982-.214-1.321-.625a1.706 1.706 0 01.232-2.411 11.443 11.443 0 002.089-2.286c-1.393.946-3 1.589-4.768 1.804-.071.018-.143.018-.214.018a1.714 1.714 0 01-1.696-1.5 1.688 1.688 0 011.482-1.911 7.26 7.26 0 002.839-.982 8.247 8.247 0 01-1.768.179 8.888 8.888 0 01-3.893-.893c-.857-.429-1.214-1.446-.786-2.304a1.723 1.723 0 012.286-.786 5.29 5.29 0 002.393.554 5.24 5.24 0 001.768-.304c-.107 0-.232.018-.339.018a5.749 5.749 0 01-5.161-3.268 1.715 1.715 0 01.821-2.286c.214-.107.446-.161.696-.161-.25 0-.482-.054-.696-.161a1.715 1.715 0 01-.821-2.286 5.747 5.747 0 015.161-3.268h.125c.25.036.5.054.75.071l5.196.482 4.268-2.143a1.11 1.11 0 01.518-.125c.411 0 .821.232 1.018.625z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(AslInterpreting);
var _default = ForwardRef;
exports["default"] = _default;