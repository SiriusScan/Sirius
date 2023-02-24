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

function Microchip(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M3.429 22.857v2.286h-2a.282.282 0 01-.286-.286v-.286H.286A.282.282 0 010 24.285v-.571c0-.161.125-.286.286-.286h.857v-.286c0-.161.125-.286.286-.286h2zm0-4.571v2.286h-2a.282.282 0 01-.286-.286V20H.286A.282.282 0 010 19.714v-.571c0-.161.125-.286.286-.286h.857v-.286c0-.161.125-.286.286-.286h2zm0-4.572V16h-2a.282.282 0 01-.286-.286v-.286H.286A.282.282 0 010 15.142v-.571c0-.161.125-.286.286-.286h.857v-.286c0-.161.125-.286.286-.286h2zm0-4.571v2.286h-2a.282.282 0 01-.286-.286v-.286H.286A.282.282 0 010 10.571V10c0-.161.125-.286.286-.286h.857v-.286c0-.161.125-.286.286-.286h2zm0-4.572v2.286h-2a.282.282 0 01-.286-.286v-.286H.286A.282.282 0 010 5.999v-.571c0-.161.125-.286.286-.286h.857v-.286c0-.161.125-.286.286-.286h2zm19.428-2.857V28c0 .946-.768 1.714-1.714 1.714H6.286A1.715 1.715 0 014.572 28V1.714C4.572.768 5.34 0 6.286 0h14.857c.946 0 1.714.768 1.714 1.714zm4.572 22v.571a.282.282 0 01-.286.286h-.857v.286a.282.282 0 01-.286.286h-2v-2.286h2c.161 0 .286.125.286.286v.286h.857c.161 0 .286.125.286.286zm0-4.571v.571a.282.282 0 01-.286.286h-.857v.286a.282.282 0 01-.286.286h-2v-2.286h2c.161 0 .286.125.286.286v.286h.857c.161 0 .286.125.286.286zm0-4.572v.571a.282.282 0 01-.286.286h-.857v.286A.282.282 0 0126 16h-2v-2.286h2c.161 0 .286.125.286.286v.286h.857c.161 0 .286.125.286.286zm0-4.571v.571a.282.282 0 01-.286.286h-.857v.286a.282.282 0 01-.286.286h-2V9.143h2c.161 0 .286.125.286.286v.286h.857c.161 0 .286.125.286.286zm0-4.571V6a.282.282 0 01-.286.286h-.857v.286a.282.282 0 01-.286.286h-2V4.572h2c.161 0 .286.125.286.286v.286h.857c.161 0 .286.125.286.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Microchip);
var _default = ForwardRef;
exports["default"] = _default;