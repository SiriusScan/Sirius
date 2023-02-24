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

function Git(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.625 27.036c0-1.571-1.732-1.786-2.946-1.786-1.268 0-2.821.268-2.821 1.857 0 1.607 1.839 1.804 3.071 1.804 1.304 0 2.696-.321 2.696-1.875zM9.571 13.554c0-1.339-.643-2.554-2.125-2.554-1.643 0-2.214 1.089-2.214 2.589 0 1.482.643 2.411 2.214 2.411C9 16 9.571 15 9.571 13.554zm4.804-5.786v3.607a12.59 12.59 0 01-1.411.393c.179.482.286.982.286 1.5 0 3.018-1.857 5.321-4.821 5.875-.893.179-1.411.554-1.411 1.518 0 2.732 7.214.875 7.214 5.911 0 4.089-2.768 5.429-6.482 5.429-3.054 0-6.536-1.018-6.536-4.696 0-2.143 1.304-3.375 3.25-4.018v-.071c-.821-.5-1.196-1.286-1.196-2.25 0-.911.196-2.036 1.125-2.446v-.071c-1.804-.607-2.982-3.089-2.982-4.893C1.411 10.217 4 7.77 7.304 7.77c1.107 0 2.214.286 3.179.839 1.339 0 2.661-.357 3.893-.839zM20.054 23.5H16.09c.071-.804.071-1.589.071-2.393V10.232c0-.768.018-1.536-.071-2.286h3.964c-.089.732-.071 1.482-.071 2.214v10.946c0 .804 0 1.589.071 2.393zm10.732-3.964v3.5c-.946.518-2.036.696-3.107.696-3.821 0-4.268-3.018-4.268-6.125v-6.268h.036v-.071c-.232 0-.446-.036-.661-.036-.357 0-.714.054-1.054.107V7.946h1.714V6.589c0-.536-.018-1.071-.107-1.589h4.054c-.143.982-.107 1.964-.107 2.946h3.054v3.393c-.518 0-1.036-.071-1.536-.071h-1.518v6.518c0 1.054.232 2.339 1.554 2.339.696 0 1.375-.196 1.946-.589zM20.5 2.625c0 1.339-1.036 2.589-2.411 2.589-1.411 0-2.464-1.232-2.464-2.589C15.625 1.25 16.661 0 18.089 0 19.5 0 20.5 1.286 20.5 2.625z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Git);
var _default = ForwardRef;
exports["default"] = _default;