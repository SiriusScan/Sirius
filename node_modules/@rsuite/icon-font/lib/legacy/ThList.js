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

function ThList(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.143 22.286v3.429c0 .946-.768 1.714-1.714 1.714H1.715a1.715 1.715 0 01-1.714-1.714v-3.429c0-.946.768-1.714 1.714-1.714h5.714c.946 0 1.714.768 1.714 1.714zm0-9.143v3.429c0 .946-.768 1.714-1.714 1.714H1.715a1.715 1.715 0 01-1.714-1.714v-3.429c0-.946.768-1.714 1.714-1.714h5.714c.946 0 1.714.768 1.714 1.714zM32 22.286v3.429c0 .946-.768 1.714-1.714 1.714H13.143a1.715 1.715 0 01-1.714-1.714v-3.429c0-.946.768-1.714 1.714-1.714h17.143c.946 0 1.714.768 1.714 1.714zM9.143 4v3.429c0 .946-.768 1.714-1.714 1.714H1.715A1.715 1.715 0 01.001 7.429V4c0-.946.768-1.714 1.714-1.714h5.714c.946 0 1.714.768 1.714 1.714zM32 13.143v3.429c0 .946-.768 1.714-1.714 1.714H13.143a1.715 1.715 0 01-1.714-1.714v-3.429c0-.946.768-1.714 1.714-1.714h17.143c.946 0 1.714.768 1.714 1.714zM32 4v3.429c0 .946-.768 1.714-1.714 1.714H13.143a1.715 1.715 0 01-1.714-1.714V4c0-.946.768-1.714 1.714-1.714h17.143C31.232 2.286 32 3.054 32 4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ThList);
var _default = ForwardRef;
exports["default"] = _default;