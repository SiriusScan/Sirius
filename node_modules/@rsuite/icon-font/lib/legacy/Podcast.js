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

function Podcast(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.75 21.286c0 1.179-.125 2.357-.304 3.518-.268 1.857-.536 3.768-.982 5.589C16.143 31.697 14.928 32 13.75 32s-2.393-.304-2.714-1.607c-.446-1.821-.714-3.732-.982-5.589-.179-1.161-.304-2.339-.304-3.518 0-2.411 1.946-3 4-3s4 .589 4 3zm9.679-7.572a13.71 13.71 0 01-8.643 12.75c-.196.071-.411-.107-.375-.321.054-.375.107-.768.179-1.179.036-.286.071-.571.107-.839.018-.107.071-.179.161-.214 3.714-1.893 6.286-5.75 6.286-10.196 0-6.518-5.464-11.768-12.054-11.411-6.036.321-10.839 5.464-10.804 11.5.036 4.446 2.625 8.286 6.357 10.143.089.036.143.125.161.214.036.25.071.518.107.804.071.429.125.821.196 1.214.036.214-.196.393-.393.304-5.304-2.071-9-7.357-8.696-13.446C.357 6.126 5.929.466 12.839.037c7.964-.5 14.589 5.821 14.589 13.679zm-9.679-.571c0 2.214-1.786 4-4 4s-4-1.786-4-4 1.786-4 4-4 4 1.786 4 4zm5.143.571a9.157 9.157 0 01-3.571 7.25c-.179.143-.429.018-.464-.214a4.164 4.164 0 00-.518-1.643c-.071-.107-.054-.25.054-.357a6.82 6.82 0 002.214-5.036c0-4.036-3.518-7.268-7.643-6.821-3.161.357-5.732 2.964-6.036 6.143a6.785 6.785 0 002.179 5.714c.107.107.125.25.054.357a4.169 4.169 0 00-.518 1.661c-.036.214-.286.339-.464.196a9.176 9.176 0 01-3.571-7.446c.107-4.75 3.964-8.714 8.696-8.929 5.25-.25 9.589 3.929 9.589 9.125z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Podcast);
var _default = ForwardRef;
exports["default"] = _default;