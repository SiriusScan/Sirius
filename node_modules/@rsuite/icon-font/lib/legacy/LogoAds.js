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

function LogoAds(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M28.985 3.595H3.015C1.353 3.595 0 4.985 0 6.688v18.624c0 1.705 1.353 3.093 3.015 3.093h25.966c1.664 0 3.017-1.387 3.017-3.093V6.688c.002-1.703-1.351-3.093-3.013-3.093zm0 21.95H3.015a.234.234 0 01-.229-.233V9.09h26.421v16.222c0 .13-.098.233-.222.233z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21.691 11.433v4.121a3.832 3.832 0 00-1.211-.848 3.562 3.562 0 00-1.401-.281c-1.081 0-2.002.409-2.759 1.23-.103.11-.192.224-.279.338l.085.24.859 2.425c.023-.654.231-1.2.631-1.625.425-.457.96-.683 1.605-.683.661 0 1.205.224 1.637.672s.649 1.033.649 1.755c0 .738-.215 1.335-.649 1.79-.43.455-.974.683-1.627.683a2.111 2.111 0 01-1.557-.654l.889 2.512c.187.03.377.05.576.05.478 0 .921-.087 1.33-.256s.818-.45 1.225-.837v.878h2.085V11.432h-2.087zM13.662 11.998H11.6l-4.046 11.23h2.773l2.29-6.752 2.306 6.752h2.715z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LogoAds);
var _default = ForwardRef;
exports["default"] = _default;