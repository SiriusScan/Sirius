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

function Save(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 27.429h13.714v-6.857H6.857v6.857zm16 0h2.286v-16c0-.339-.304-1.071-.536-1.304l-5.018-5.018c-.25-.25-.946-.536-1.304-.536V12c0 .946-.768 1.714-1.714 1.714H6.285A1.715 1.715 0 014.571 12V4.571H2.285v22.857h2.286v-7.429c0-.946.768-1.714 1.714-1.714h14.857c.946 0 1.714.768 1.714 1.714v7.429zM16 10.857V5.143a.587.587 0 00-.571-.571H12a.587.587 0 00-.571.571v5.714c0 .304.268.571.571.571h3.429a.587.587 0 00.571-.571zm11.429.572V28c0 .946-.768 1.714-1.714 1.714h-24A1.715 1.715 0 01.001 28V4c0-.946.768-1.714 1.714-1.714h16.571c.946 0 2.25.536 2.929 1.214l5 5c.679.679 1.214 1.982 1.214 2.929z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Save);
var _default = ForwardRef;
exports["default"] = _default;