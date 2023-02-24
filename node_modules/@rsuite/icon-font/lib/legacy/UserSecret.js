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

function UserSecret(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.286 27.429l1.714-8-1.714-2.286L8 16zm4.571 0L17.143 16l-2.286 1.143-1.714 2.286zm2.857-18.036a.39.39 0 00-.071-.107c-.161-.125-1.446-.143-1.714-.143-1.018 0-1.982.143-2.982.339-.125.036-.25.036-.375.036s-.25 0-.375-.036c-1-.196-1.964-.339-2.982-.339-.268 0-1.554.018-1.714.143a.349.349 0 00-.071.107c.018.161.036.321.071.482.107.143.196.089.268.304.464 1.268.679 2.25 2.286 2.25 2.304 0 1.661-2.125 2.411-2.125h.214c.75 0 .107 2.125 2.411 2.125 1.607 0 1.821-.982 2.286-2.25.071-.214.161-.161.268-.304.036-.161.054-.321.071-.482zm7.429 15.696c0 2.911-1.911 4.625-4.768 4.625H4.768C1.911 29.714 0 28 0 25.089c0-3.232.571-8.125 3.893-9.732l-1.607-3.929h3.821a7.066 7.066 0 01-.393-2.286c0-.196.018-.393.036-.571-.696-.143-3.464-.714-3.464-1.714 0-1.054 3.036-1.625 3.75-1.768C6.411 3.75 7.304 1.714 8.215.66c.357-.411.804-.661 1.357-.661 1.071 0 1.929 1.107 3 1.107s1.929-1.107 3-1.107c.554 0 1 .25 1.357.661.911 1.054 1.804 3.089 2.179 4.429.714.143 3.75.714 3.75 1.768 0 1-2.768 1.571-3.464 1.714a6.795 6.795 0 01-.357 2.857h3.821l-1.464 4.018c3.196 1.661 3.75 6.464 3.75 9.643z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserSecret);
var _default = ForwardRef;
exports["default"] = _default;