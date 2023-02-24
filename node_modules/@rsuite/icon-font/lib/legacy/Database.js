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

function Database(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.714 13.714c5.375 0 10.768-.964 13.714-3.036v3.036c0 2.518-6.143 4.571-13.714 4.571S0 16.231 0 13.714v-3.036c2.946 2.071 8.339 3.036 13.714 3.036zm0 13.715c5.375 0 10.768-.964 13.714-3.036v3.036c0 2.518-6.143 4.571-13.714 4.571S0 29.946 0 27.429v-3.036c2.946 2.071 8.339 3.036 13.714 3.036zm0-6.858c5.375 0 10.768-.964 13.714-3.036v3.036c0 2.518-6.143 4.571-13.714 4.571S0 23.088 0 20.571v-3.036c2.946 2.071 8.339 3.036 13.714 3.036zm0-20.571c7.571 0 13.714 2.054 13.714 4.571v2.286c0 2.518-6.143 4.571-13.714 4.571S0 9.374 0 6.857V4.571C0 2.053 6.143 0 13.714 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Database);
var _default = ForwardRef;
exports["default"] = _default;