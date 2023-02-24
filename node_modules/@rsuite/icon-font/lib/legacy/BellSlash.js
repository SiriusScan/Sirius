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

function BellSlash(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.821 15.214c.911 5.321 3.25 8.179 5.321 9.929a2.302 2.302 0 01-2.286 2.286h-8c0 2.518-2.054 4.571-4.571 4.571s-4.554-2.036-4.571-4.554zm-9.535 15.357c.161 0 .286-.125.286-.286s-.125-.286-.286-.286a2.583 2.583 0 01-2.571-2.571c0-.161-.125-.286-.286-.286s-.286.125-.286.286a3.148 3.148 0 003.143 3.143zM36.179 2a.605.605 0 01-.054.821L2.696 31.785a.57.57 0 01-.804-.071L.392 30c-.196-.25-.179-.607.054-.804l3.321-2.875a2.266 2.266 0 01-.339-1.179c2.643-2.232 5.714-6.232 5.714-14.857 0-3.429 2.839-7.179 7.571-7.875a1.8 1.8 0 01-.143-.696 1.715 1.715 0 113.285.696c3.071.446 5.339 2.179 6.554 4.286L33.873.214a.57.57 0 01.804.071z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(BellSlash);
var _default = ForwardRef;
exports["default"] = _default;