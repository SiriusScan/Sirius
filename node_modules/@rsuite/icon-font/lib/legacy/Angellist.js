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

function Angellist(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.018 6.75l-2.036 5.857 2.089.375c.536-1.464 2.946-8.054 2.946-9.25 0-.446-.143-1-.679-1-1 0-2.071 3.25-2.321 4.018zm-5.339 12.268c.196.518.411 1.036.589 1.571.393-.446.804-.857 1.268-1.196-.625-.125-1.25-.179-1.857-.375zm-5.215-16c0 1.821 2.161 7.5 2.839 9.304.25-.143.571-.179.875-.179.429 0 .911.054 1.339.089L9.356 5.964c-.232-.679-1.268-3.929-2.196-3.929-.482 0-.696.571-.696.982zm-1.41 13.553c0 1.304 3.5 6.107 4.804 6.107.357 0 .661-.393.661-.714 0-.411-.411-1.429-.571-1.821-.464-1.196-2.161-4.893-3.625-4.893-.482 0-1.268.839-1.268 1.321zm-2.822 5.983c0 .643.214 1.268.446 1.857 1.411 3.482 4.589 5.518 8.304 5.518 2.714 0 5-1.036 6.821-3.036 1.929-2.143 2.714-4.786 2.714-7.625 0-1 .018-2.589-.768-3.304-1.5-1.321-6.589-1.821-8.607-1.821-.25 0-.679.018-.875.196-.214.089-.214.429-.214.625 0 2.732 5.768 2.482 7.5 2.482.339 0 .5.089.714.339.232.286.304.625.339.982-.464.464-1.107.732-1.714.964-.589.214-1.161.446-1.661.821-1.375 1-2.732 2.714-2.732 4.482 0 1.107.661 2.054.661 3.143 0 .018-.125.411-.125.464-2.036-.143-2.536-2.161-2.607-3.857-.214.054-.5.036-.732.036.036.125.036.25.036.375 0 1.304-1.161 2.25-2.411 2.25-1.929 0-4.482-2.268-4.482-4.232 0-.536.232-.839.589-1.196.357.446.732.893 1.071 1.357.518.696 1.411 1.857 2.375 1.857.25 0 .732-.214.732-.518 0-.804-2.929-4.571-3.643-4.571-1.125 0-1.732 1.482-1.732 2.411zm-2.036.16c0-2.321.893-3.857 3.196-4.482-.196-.518-.5-1.304-.5-1.857 0-1.464 1.804-3.286 3.268-3.286.429 0 .857.125 1.25.268-.75-2.125-2.911-8.107-2.911-10.125C4.499 1.428 5.41 0 7.356 0c2.5 0 5.339 9 5.946 10.786C14.088 8.822 16.552.59 19.338.59c1.75 0 2.732 1.393 2.732 3.054 0 1.893-2.107 7.786-2.839 9.821 3 .732 3.429 3.161 3.429 5.857 0 7.143-4.554 12.679-11.929 12.679-1.357 0-2.696-.268-3.982-.75C3.356 29.965.195 26.483.195 22.715z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Angellist);
var _default = ForwardRef;
exports["default"] = _default;