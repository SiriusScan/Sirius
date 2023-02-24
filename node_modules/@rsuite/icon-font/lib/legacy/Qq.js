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

function Qq(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.821 14.393c-.125-.304-.143-.607-.143-.929 0-.5.321-1.304.625-1.679-.018-.464.179-1.411.536-1.714 0-3.304 2.554-7.464 5.536-8.893 1.839-.875 3.768-1.179 5.786-1.179 1.571 0 3.286.375 4.75.982 4.196 1.768 5.143 5.054 6.036 9.25l.018.089c.518.786.982 1.714.982 2.679 0 .482-.321.964-.321 1.393 0 .036.107.179.125.214 1.536 2.268 2.929 4.732 2.929 7.554 0 .625-.339 2.804-1.339 2.804-.696 0-1.464-1.696-1.714-2.161-.018-.018-.036-.018-.054-.018l-.089.071c-.571 1.482-1.196 2.875-2.357 3.982 1.018.982 2.661.893 2.964 2.589-.089.196-.054.411-.196.607-1.018 1.536-3.75 1.732-5.393 1.732-2.179 0-3.946-.571-6-1.179-.429-.125-1.071-.054-1.536-.107-1.089 1.196-3.75 1.518-5.286 1.518-1.357 0-6.607-.089-6.607-2.411 0-1 .214-1.286.911-1.929.554-.107.964-.411 1.607-.446.089 0 .161-.018.25-.036.018-.018.036-.018.036-.071l-.036-.054c-1.232-.286-2.964-3.393-3.232-4.679l-.089-.054c-.125 0-.179.268-.214.357-.393.911-1.321 1.893-2.357 2H.931c-.143 0-.089-.143-.196-.179-.25-.589-.411-1.125-.411-1.786 0-3.571 1.714-6.214 4.5-8.321z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Qq);
var _default = ForwardRef;
exports["default"] = _default;