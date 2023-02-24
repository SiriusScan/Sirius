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

function Download2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M24.617 26.503c0-.315-.121-.594-.368-.823a1.205 1.205 0 00-.866-.345 1.25 1.25 0 00-.866.345 1.101 1.101 0 000 1.644c.242.231.533.345.866.345.331.005.622-.117.866-.345.247-.229.368-.505.368-.821zm4.926 0c0-.315-.121-.594-.368-.823a1.197 1.197 0 00-.866-.345 1.25 1.25 0 00-.866.345 1.084 1.084 0 00-.368.823c0 .315.121.59.368.821.242.231.533.345.866.345.336.005.622-.117.866-.345a1.1 1.1 0 00.368-.821zM32 22.418v5.833c0 .487-.181.903-.539 1.241a1.824 1.824 0 01-1.305.507H1.847c-.512 0-.949-.167-1.305-.507S0 28.735 0 28.249v-5.833c0-.487.181-.898.539-1.239a1.825 1.825 0 011.305-.512h8.944l2.601 2.482a3.742 3.742 0 002.615 1.019 3.747 3.747 0 002.617-1.019l2.615-2.482h8.928c.512 0 .949.169 1.305.512.354.345.53.754.53 1.241zm-6.249-10.375c.217.503.128.926-.27 1.278l-8.615 8.167a1.171 1.171 0 01-.866.347c-.345 0-.631-.121-.866-.35l-8.615-8.167c-.398-.35-.487-.775-.27-1.275.217-.471.599-.709 1.134-.709h4.921V3.165c0-.313.123-.587.368-.823.242-.231.53-.343.864-.343h4.921c.331 0 .622.117.866.345.247.233.368.505.368.823v8.169h4.921c.539-.002.919.235 1.138.706z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Download2);
var _default = ForwardRef;
exports["default"] = _default;