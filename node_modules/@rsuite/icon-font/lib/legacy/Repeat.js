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

function Repeat(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.429 4.571v8c0 .625-.518 1.143-1.143 1.143h-8c-.464 0-.875-.286-1.054-.714a1.1 1.1 0 01.25-1.232l2.464-2.464a9.169 9.169 0 00-6.232-2.446c-5.036 0-9.143 4.107-9.143 9.143s4.107 9.143 9.143 9.143a9.04 9.04 0 007.214-3.554c.089-.125.25-.196.411-.214.161 0 .321.054.446.161l2.446 2.464c.214.196.214.536.036.768a13.682 13.682 0 01-10.554 4.946c-7.554 0-13.714-6.161-13.714-13.714S6.16 2.287 13.713 2.287c3.518 0 6.929 1.411 9.446 3.786l2.321-2.304a1.123 1.123 0 011.25-.25c.411.179.696.589.696 1.054z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Repeat);
var _default = ForwardRef;
exports["default"] = _default;