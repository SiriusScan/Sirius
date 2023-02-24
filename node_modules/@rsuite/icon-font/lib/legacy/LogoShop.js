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

function LogoShop(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M28.985 3.595H3.015C1.353 3.595 0 4.985 0 6.688v18.624c0 1.705 1.353 3.093 3.015 3.093h25.966c1.664 0 3.017-1.387 3.017-3.093V6.688c.002-1.703-1.351-3.093-3.013-3.093zm0 21.95H3.015a.234.234 0 01-.229-.233V9.09h26.421v16.222c0 .13-.098.233-.222.233z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M24.503 11.365h-2.642a.684.684 0 00-.663.505l-2.103 7.568h-8.599l-.359-1.577h5.045a.69.69 0 100-1.38H9.827l-.341-1.497h5.154a.69.69 0 100-1.38H8.585a.691.691 0 00-.69.69c0 .121.039.229.094.329l1.291 5.689c.005.023.034.027.041.048a.683.683 0 00.642.457h9.653a.686.686 0 00.663-.505l2.101-7.566h2.119c.379 0 .69-.309.69-.69a.685.685 0 00-.686-.69zM12.322 22.455a.976.976 0 11-1.952 0 .976.976 0 011.952 0zM19.392 22.455a.978.978 0 11-1.956 0 .978.978 0 011.956 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.597 18.219l-.206.085a.146.146 0 01-.192-.08l-.782-1.895-.834.345.023-2.992 2.126 2.105-.834.343.782 1.895a.15.15 0 01-.082.194z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LogoShop);
var _default = ForwardRef;
exports["default"] = _default;