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

function CodeFork(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 18 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.143 26.286a1.715 1.715 0 10-3.43.002 1.715 1.715 0 003.43-.002zm0-20.572a1.715 1.715 0 10-3.43.002 1.715 1.715 0 003.43-.002zM16.571 8a1.715 1.715 0 10-3.43.002A1.715 1.715 0 0016.571 8zm1.715 0a3.428 3.428 0 01-1.714 2.964c-.054 6.446-4.625 7.875-7.661 8.839-2.839.893-3.768 1.321-3.768 3.054v.464a3.428 3.428 0 011.714 2.964 3.43 3.43 0 01-6.858 0c0-1.268.696-2.375 1.714-2.964V8.678A3.428 3.428 0 01-.001 5.714a3.43 3.43 0 016.858 0 3.428 3.428 0 01-1.714 2.964v8.875c.911-.446 1.875-.75 2.75-1.018 3.321-1.054 5.214-1.839 5.25-5.571A3.428 3.428 0 0111.429 8a3.43 3.43 0 016.858 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CodeFork);
var _default = ForwardRef;
exports["default"] = _default;