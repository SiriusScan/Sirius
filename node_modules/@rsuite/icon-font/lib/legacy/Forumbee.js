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

function Forumbee(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.679 2.679C9.125 5.554 3.179 11.59.358 19.161a14.386 14.386 0 01-.357-3.143c0-7.554 6.107-13.679 13.661-13.679 1.018 0 2.036.125 3.018.339zm4.803 2.125a13.465 13.465 0 012.929 2.768A28.06 28.06 0 005.286 26.804a13.29 13.29 0 01-2.768-2.893c2.661-9.179 9.804-16.393 18.964-19.107zM8.393 28.625a28.07 28.07 0 0117.839-17.964c.482 1.107.804 2.286.964 3.482a28.109 28.109 0 00-15.339 15.411 13.598 13.598 0 01-3.464-.929zm19.036 1.036a64.605 64.605 0 01-6.554-2.054 13.457 13.457 0 01-5.179 1.911 28.348 28.348 0 0111.482-11.536 13.476 13.476 0 01-1.804 5.071 65.816 65.816 0 012.054 6.607z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Forumbee);
var _default = ForwardRef;
exports["default"] = _default;