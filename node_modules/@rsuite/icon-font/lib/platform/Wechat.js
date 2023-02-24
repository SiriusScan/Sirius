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

function Wechat(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6 1c3.5 0 6 2 6 5-1.5 0-3.272.8-4 1.8-.686.943-1.2 2.389-.8 4-.4.2-.927.2-1.2.2a6.463 6.463 0 01-2.221-.389L1 13l.673-2.69C.637 9.322 0 7.979 0 6.5 0 3.462 2.5 1 6 1zM3.75 4a.75.75 0 100 1.5.75.75 0 000-1.5zm4 0a.75.75 0 100 1.5.75.75 0 000-1.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7c2.231 0 4 1.5 4 3.75 0 .95-.436 2.095-1.208 2.754L15 15l-1.727-.681c-.406.12-.834.181-1.273.181-2.231 0-4-1.5-4-3.75S9.769 7 12 7zm-1.25 2a.75.75 0 100 1.5.75.75 0 000-1.5zm3 0a.75.75 0 100 1.5.75.75 0 000-1.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Wechat);
var _default = ForwardRef;
exports["default"] = _default;