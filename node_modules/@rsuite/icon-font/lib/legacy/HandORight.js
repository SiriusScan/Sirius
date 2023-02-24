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

function HandORight(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.571 24c0-.625-.518-1.143-1.143-1.143S2.285 23.375 2.285 24s.518 1.143 1.143 1.143S4.571 24.625 4.571 24zm25.143-10.286c0-1.214-1.089-2.286-2.286-2.286H17.142c0-1.125 1.714-2.286 1.714-4.571 0-1.714-1.339-2.286-2.857-2.286-.5 0-1.411 2.071-1.607 2.482a24.24 24.24 0 01-.661 1.161c-.589.946-1.268 1.768-2 2.589-1.143 1.304-2.411 2.911-4.304 2.911h-.571v11.429h.571c3.125 0 6.179 2.286 9.643 2.286 2 0 3.375-.839 3.375-2.982 0-.339-.036-.679-.089-1 .75-.411 1.161-1.429 1.161-2.25a2.49 2.49 0 00-.321-1.232c.607-.571.946-1.286.946-2.125 0-.571-.25-1.411-.625-1.839h5.911c1.232 0 2.286-1.054 2.286-2.286zM32 13.696c0 2.5-2.071 4.589-4.571 4.589h-3.018a5.02 5.02 0 01-.661 2.125c.036.25.054.518.054.768 0 1.143-.375 2.286-1.071 3.179.036 3.375-2.268 5.357-5.571 5.357-2 0-3.893-.554-5.75-1.232-1.089-.393-2.857-1.054-3.982-1.054H2.287a2.279 2.279 0 01-2.286-2.286V13.713a2.279 2.279 0 012.286-2.286H7.43c.857 0 2.071-1.536 2.589-2.125.643-.732 1.25-1.464 1.786-2.304 1.036-1.661 1.804-4.714 4.196-4.714 2.839 0 5.143 1.554 5.143 4.571 0 .786-.125 1.554-.393 2.286h6.679c2.464 0 4.571 2.089 4.571 4.554z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandORight);
var _default = ForwardRef;
exports["default"] = _default;