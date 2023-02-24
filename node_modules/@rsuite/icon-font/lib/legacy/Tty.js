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

function Tty(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8 23.429v3.429c0 .321-.25.571-.571.571H4a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zm-3.429-6.858V20c0 .321-.25.571-.571.571H.571A.564.564 0 010 20v-3.429C0 16.25.25 16 .571 16H4c.321 0 .571.25.571.571zm10.286 6.858v3.429c0 .321-.25.571-.571.571h-3.429a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zm-3.428-6.858V20c0 .321-.25.571-.571.571H7.429A.564.564 0 016.858 20v-3.429c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zm-10.25-2.857A1.163 1.163 0 010 12.553v-2.304h9.179v2.304c0 .643-.518 1.161-1.161 1.161H1.179zm20.535 9.715v3.429c0 .321-.25.571-.571.571h-3.429a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zm-3.428-6.858V20c0 .321-.25.571-.571.571h-3.429a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zm10.285 6.858v3.429c0 .321-.25.571-.571.571h-3.429a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571H28c.321 0 .571.25.571.571zm-3.428-6.858V20c0 .321-.25.571-.571.571h-3.429a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zM32 9.286v.232h-9.179v-.179c0-.661-.571-1.857-6.821-1.821-6.25.018-6.821 1.161-6.821 1.821v.179H0v-.232c0-1.196 2.143-7 16-7 13.839 0 16 5.804 16 7zm0 7.285V20c0 .321-.25.571-.571.571H28a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zm0-6.321v2.304c0 .643-.518 1.161-1.161 1.161h-6.857a1.159 1.159 0 01-1.161-1.161V10.25H32z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Tty);
var _default = ForwardRef;
exports["default"] = _default;