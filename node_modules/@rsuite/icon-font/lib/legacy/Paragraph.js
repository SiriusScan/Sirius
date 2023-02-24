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

function Paragraph(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.821 3.375v1.304c0 .607-.482 1.661-1.089 1.661-.304 0-.661-.054-.964.018a.751.751 0 00-.571.554c-.089.339-.054.768-.054 1.143v20.571c0 .607-.482 1.089-1.089 1.089h-1.929a1.082 1.082 0 01-1.089-1.089V6.876h-2.554v21.75c0 .607-.482 1.089-1.089 1.089h-1.929a1.082 1.082 0 01-1.089-1.089v-8.857c-1.732-.143-3.214-.5-4.375-1.054a7.356 7.356 0 01-3.429-3.196C.821 14.144.428 12.59.428 10.894c0-1.982.536-3.696 1.571-5.107C3.053 4.376 4.303 3.43 5.731 2.948c1.339-.446 4.161-.661 7.446-.661h8.554c.607 0 1.089.482 1.089 1.089z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Paragraph);
var _default = ForwardRef;
exports["default"] = _default;