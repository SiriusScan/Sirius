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

function RedditAlien(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M32 15.107a3.551 3.551 0 01-1.946 3.179c.143.554.214 1.125.214 1.714 0 5.643-6.375 10.214-14.232 10.214-7.839 0-14.214-4.571-14.214-10.214 0-.571.071-1.143.196-1.679A3.583 3.583 0 010 15.107a3.552 3.552 0 013.554-3.554c1.018 0 1.929.429 2.589 1.125 2.411-1.679 5.625-2.768 9.196-2.893L17.41.481a.625.625 0 01.732-.464l6.589 1.446a2.672 2.672 0 015.054 1.197 2.675 2.675 0 01-2.679 2.679 2.668 2.668 0 01-2.661-2.661l-5.964-1.321-1.857 8.429c3.589.107 6.839 1.179 9.268 2.857a3.503 3.503 0 012.554-1.089A3.552 3.552 0 0132 15.108zM7.464 18.661a2.671 2.671 0 002.661 2.679 2.675 2.675 0 002.679-2.679A2.671 2.671 0 0010.125 16a2.668 2.668 0 00-2.661 2.661zM21.929 25a.637.637 0 000-.929.647.647 0 00-.911 0c-1.071 1.089-3.375 1.464-5.018 1.464s-3.946-.375-5.018-1.464a.647.647 0 00-.911 0c-.268.25-.268.661 0 .929 1.696 1.696 4.964 1.821 5.929 1.821s4.232-.125 5.929-1.821zm-.054-3.661a2.671 2.671 0 002.661-2.679 2.668 2.668 0 00-2.661-2.661 2.671 2.671 0 00-2.679 2.661 2.675 2.675 0 002.679 2.679z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(RedditAlien);
var _default = ForwardRef;
exports["default"] = _default;