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

function Hourglass3(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 2.286c0 6.607-3.161 11.393-6.661 13.714 3.5 2.321 6.661 7.107 6.661 13.714h1.714c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571H.571A.564.564 0 010 31.428v-1.143c0-.321.25-.571.571-.571h1.714c0-6.607 3.161-11.393 6.661-13.714-3.5-2.321-6.661-7.107-6.661-13.714H.571A.564.564 0 010 1.715V.572C0 .251.25.001.571.001h26.286c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571h-1.714zm-9.536 12.643c3.607-1.357 7.25-6.125 7.25-12.643H4.571c0 6.518 3.643 11.286 7.25 12.643a1.14 1.14 0 010 2.142c-1.536.571-3.089 1.786-4.357 3.5h12.5c-1.268-1.714-2.821-2.929-4.357-3.5a1.14 1.14 0 010-2.142z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Hourglass3);
var _default = ForwardRef;
exports["default"] = _default;