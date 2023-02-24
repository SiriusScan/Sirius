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

function SunO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.286 16c0-5.679-4.607-10.286-10.286-10.286S5.714 10.321 5.714 16 10.321 26.286 16 26.286 26.286 21.679 26.286 16zm4.928 4.946a.546.546 0 01-.357.357l-5.214 1.714v5.464a.59.59 0 01-.232.464c-.161.107-.339.143-.518.071l-5.214-1.679-3.214 4.429c-.107.143-.286.232-.464.232s-.357-.089-.464-.232l-3.214-4.429-5.214 1.679a.543.543 0 01-.518-.071.592.592 0 01-.232-.464v-5.464l-5.214-1.714c-.161-.054-.304-.179-.357-.357s-.036-.375.071-.518l3.214-4.429L.859 11.57c-.107-.161-.125-.339-.071-.518s.196-.304.357-.357l5.214-1.714V3.517a.59.59 0 01.232-.464c.161-.107.339-.143.518-.071l5.214 1.679L15.537.232c.214-.286.714-.286.929 0l3.214 4.429 5.214-1.679a.543.543 0 01.518.071.592.592 0 01.232.464v5.464l5.214 1.714c.161.054.304.179.357.357s.036.357-.071.518l-3.214 4.429 3.214 4.429a.585.585 0 01.071.518z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SunO);
var _default = ForwardRef;
exports["default"] = _default;