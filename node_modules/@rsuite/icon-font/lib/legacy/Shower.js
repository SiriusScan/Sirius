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

function Shower(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.589 4.446a.571.571 0 010 .821L14.41 16.446a.571.571 0 01-.821 0l-1.464-1.464a.571.571 0 010-.821l.786-.786a6.805 6.805 0 01-.625-7.536 4.534 4.534 0 00-3.143-1.268 4.58 4.58 0 00-4.571 4.571v22.857H.001V9.142c0-5.036 4.107-9.143 9.143-9.143a9.1 9.1 0 016.554 2.786 6.849 6.849 0 016.821.982l.786-.786a.571.571 0 01.821 0zM24 9.143c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143.518-1.143 1.143-1.143zm4.571 2.286c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143 1.143.518 1.143 1.143-.518 1.143-1.143 1.143zm4.572-2.286c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143S32 10.911 32 10.286s.518-1.143 1.143-1.143zm-11.429 2.286c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143.518-1.143 1.143-1.143zm3.429 1.142c0-.625.518-1.143 1.143-1.143s1.143.518 1.143 1.143-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143zm5.714-1.142c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143.518-1.143 1.143-1.143zm-11.428 2.285c.625 0 1.143.518 1.143 1.143S20.054 16 19.429 16s-1.143-.518-1.143-1.143.518-1.143 1.143-1.143zM24 16c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143 1.143.518 1.143 1.143S24.625 16 24 16zm4.571-2.286c.625 0 1.143.518 1.143 1.143S29.196 16 28.571 16s-1.143-.518-1.143-1.143.518-1.143 1.143-1.143zm-6.857 4.572c-.625 0-1.143-.518-1.143-1.143S21.089 16 21.714 16s1.143.518 1.143 1.143-.518 1.143-1.143 1.143zM26.286 16c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143S25.661 16 26.286 16zm-6.857 2.286c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143.518-1.143 1.143-1.143zm4.571 0c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143.518-1.143 1.143-1.143zm-2.286 2.285c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143.518-1.143 1.143-1.143zm-2.285 2.286c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143-1.143-.518-1.143-1.143.518-1.143 1.143-1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Shower);
var _default = ForwardRef;
exports["default"] = _default;