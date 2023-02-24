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

function AssistiveListeningSystems(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M2.286 30.857c0 .625-.518 1.143-1.143 1.143S0 31.482 0 30.857s.518-1.143 1.143-1.143 1.143.518 1.143 1.143zm3.428-3.428c0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143.518-1.143 1.143-1.143 1.143.518 1.143 1.143zm.804-6.518l4.571 4.571-1.607 1.607-4.571-4.571zm6.053-.34c0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143.518-1.143 1.143-1.143 1.143.518 1.143 1.143zm12.625-5.714c0 2.964-1.393 4.554-2.607 5.964-1.125 1.286-2.018 2.304-2.018 4.321a6.858 6.858 0 01-6.857 6.857c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143a4.58 4.58 0 004.571-4.571c0-2.875 1.375-4.446 2.571-5.821 1.107-1.268 2.054-2.357 2.054-4.464 0-4.411-3.589-8-8-8s-8 3.589-8 8c0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143c0-5.679 4.607-10.286 10.286-10.286s10.286 4.607 10.286 10.286zM16 17.143c0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143S14.232 16 14.857 16 16 16.518 16 17.143zm5.143-2.286c0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143c0-2.214-1.786-4-4-4-2.196 0-4 1.786-4 4 0 .625-.518 1.143-1.143 1.143s-1.143-.518-1.143-1.143c0-3.464 2.821-6.286 6.286-6.286s6.286 2.821 6.286 6.286zm7.036-5.161a1.147 1.147 0 01-.661 1.482 1.04 1.04 0 01-.411.071c-.446 0-.893-.268-1.054-.732a12.002 12.002 0 00-4-5.268 1.138 1.138 0 01-.232-1.589c.393-.5 1.107-.607 1.607-.232a14.318 14.318 0 014.75 6.268zm3.75-1.446a1.163 1.163 0 01-.661 1.482 1.1 1.1 0 01-.411.071c-.464 0-.893-.268-1.071-.732a15.973 15.973 0 00-5.304-7.018A1.122 1.122 0 0124.25.464a1.122 1.122 0 011.589-.232 18.238 18.238 0 016.089 8.018z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(AssistiveListeningSystems);
var _default = ForwardRef;
exports["default"] = _default;