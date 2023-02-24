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

function Certificate(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M24.571 16l2.464 2.411c.339.321.464.804.357 1.25a1.295 1.295 0 01-.929.911l-3.357.857.946 3.321c.125.446 0 .929-.339 1.25a1.254 1.254 0 01-1.25.339l-3.321-.946-.857 3.357a1.295 1.295 0 01-.911.929 2.168 2.168 0 01-.339.036c-.339 0-.679-.143-.911-.393l-2.411-2.464-2.411 2.464a1.303 1.303 0 01-1.25.357 1.265 1.265 0 01-.911-.929l-.857-3.357-3.321.946c-.446.125-.929 0-1.25-.339a1.254 1.254 0 01-.339-1.25l.946-3.321-3.357-.857a1.295 1.295 0 01-.929-.911 1.303 1.303 0 01.357-1.25L2.855 16 .391 13.589a1.303 1.303 0 01-.357-1.25c.125-.446.482-.804.929-.911l3.357-.857-.946-3.321c-.125-.446 0-.929.339-1.25a1.254 1.254 0 011.25-.339l3.321.946.857-3.357c.107-.446.464-.804.911-.911.446-.125.929 0 1.25.339l2.411 2.482 2.411-2.482a1.243 1.243 0 011.25-.339c.446.107.804.464.911.911l.857 3.357 3.321-.946c.446-.125.929 0 1.25.339.339.321.464.804.339 1.25l-.946 3.321 3.357.857c.446.107.804.464.929.911.107.446-.018.929-.357 1.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Certificate);
var _default = ForwardRef;
exports["default"] = _default;