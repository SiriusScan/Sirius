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

function Commenting(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 16c0-1.268-1.018-2.286-2.286-2.286S6.857 14.732 6.857 16s1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm6.857 0c0-1.268-1.018-2.286-2.286-2.286S13.714 14.732 13.714 16s1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm6.857 0c0-1.268-1.018-2.286-2.286-2.286S20.571 14.732 20.571 16s1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zM32 16c0 6.321-7.161 11.429-16 11.429-1.304 0-2.571-.107-3.768-.321-2.036 2.036-4.696 3.429-7.768 4.089-.482.089-1 .179-1.536.232A.584.584 0 012.303 31c-.071-.286.143-.464.357-.661 1.125-1.054 2.464-1.893 2.929-5.661C2.178 22.589 0 19.482 0 15.999 0 9.678 7.161 4.57 16 4.57s16 5.107 16 11.429z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Commenting);
var _default = ForwardRef;
exports["default"] = _default;