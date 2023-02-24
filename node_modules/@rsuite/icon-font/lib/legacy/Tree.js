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

function Tree(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.857 26.286c0 .625-.518 1.143-1.143 1.143h-8.25c.054 1.143.196 2.339.196 3.5 0 .589-.482 1.071-1.089 1.071h-5.714a1.078 1.078 0 01-1.089-1.071c0-1.161.143-2.357.196-3.5h-8.25a1.151 1.151 0 01-1.143-1.143c0-.304.125-.589.339-.804l7.179-7.196H4a1.151 1.151 0 01-1.143-1.143c0-.304.125-.589.339-.804l7.179-7.196H6.857A1.151 1.151 0 015.714 8c0-.304.125-.589.339-.804L12.91.339c.214-.214.5-.339.804-.339s.589.125.804.339l6.857 6.857c.214.214.339.5.339.804 0 .625-.518 1.143-1.143 1.143h-3.518l7.179 7.196c.214.214.339.5.339.804 0 .625-.518 1.143-1.143 1.143h-4.089l7.179 7.196c.214.214.339.5.339.804z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Tree);
var _default = ForwardRef;
exports["default"] = _default;