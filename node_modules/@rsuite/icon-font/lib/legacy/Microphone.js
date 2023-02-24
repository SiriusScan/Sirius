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

function Microphone(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 21 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.571 12.571v2.286c0 5.286-4 9.643-9.143 10.214v2.357h4.571c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143H4.57c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143h4.571v-2.357C3.998 24.5-.002 20.142-.002 14.857v-2.286c0-.625.518-1.143 1.143-1.143s1.143.518 1.143 1.143v2.286c0 4.411 3.589 8 8 8s8-3.589 8-8v-2.286c0-.625.518-1.143 1.143-1.143s1.143.518 1.143 1.143zM16 5.714v9.143c0 3.143-2.571 5.714-5.714 5.714S4.572 18 4.572 14.857V5.714C4.572 2.571 7.143 0 10.286 0S16 2.571 16 5.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Microphone);
var _default = ForwardRef;
exports["default"] = _default;