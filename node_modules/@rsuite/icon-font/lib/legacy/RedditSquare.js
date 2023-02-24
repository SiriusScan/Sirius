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

function RedditSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.768 20.161a.334.334 0 010 .464c-.875.875-2.554.946-3.054.946s-2.179-.071-3.054-.946a.334.334 0 010-.464.305.305 0 01.464 0c.554.554 1.75.75 2.589.75s2.036-.196 2.589-.75a.305.305 0 01.464 0zm-4.697-2.786c0 .75-.625 1.375-1.375 1.375s-1.375-.625-1.375-1.375a1.375 1.375 0 012.75 0zm6.036 0c0 .75-.625 1.375-1.375 1.375s-1.375-.625-1.375-1.375a1.375 1.375 0 012.75 0zm3.839-1.839c0-1-.821-1.821-1.839-1.821-.5 0-.964.214-1.304.554-1.25-.857-2.929-1.411-4.768-1.464l.964-4.339 3.054.696c.018.75.625 1.357 1.375 1.357s1.375-.625 1.375-1.375-.625-1.375-1.375-1.375c-.536 0-1 .304-1.232.768l-3.375-.75c-.179-.054-.339.071-.375.232l-1.071 4.786c-1.839.071-3.5.625-4.732 1.482a1.832 1.832 0 00-3.16 1.25c0 .732.429 1.357 1.036 1.661a4.463 4.463 0 00-.089.857c0 2.911 3.268 5.268 7.304 5.268s7.321-2.357 7.321-5.268c0-.304-.036-.589-.107-.875.589-.304 1-.929 1-1.643zm5.483-8.107v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(RedditSquare);
var _default = ForwardRef;
exports["default"] = _default;