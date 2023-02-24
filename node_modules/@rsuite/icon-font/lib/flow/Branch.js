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

function Branch(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M1 6v3h2V6H1zm0-1h2a1 1 0 011 1v3a1 1 0 01-1 1H1a1 1 0 01-1-1V6a1 1 0 011-1zm10.5-4a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 0111.5 1zm0 1a.5.5 0 100 1 .5.5 0 000-1zm3 4a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 0114.5 6zm0 1a.5.5 0 100 1 .5.5 0 000-1zm-2 5a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 0112.5 12zm0 1a.5.5 0 100 1 .5.5 0 000-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.837 7H14v1H8.801c.13.384.224.892.314 1.543.087.63.089.643.128.875C9.545 12.231 10.1 13 11.5 13h.5v1h-.5c-2.017 0-2.87-1.181-3.243-3.418a24.513 24.513 0 01-.132-.901C7.943 8.372 7.788 8 7.5 8H3V7h2.5c.141 0 .341-.22.633-.804.09-.18.53-1.14.67-1.42C7.712 2.958 8.766 2 10.5 2h.5v1h-.5c-1.266 0-2.045.708-2.803 2.224-.13.26-.57 1.22-.67 1.42a6.726 6.726 0 01-.19.356z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Branch);
var _default = ForwardRef;
exports["default"] = _default;