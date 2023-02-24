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

function Hourglass2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 2.286c0 6.607-3.161 11.393-6.661 13.714 3.5 2.321 6.661 7.107 6.661 13.714h1.714c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571H.571A.564.564 0 010 31.428v-1.143c0-.321.25-.571.571-.571h1.714c0-6.607 3.161-11.393 6.661-13.714-3.5-2.321-6.661-7.107-6.661-13.714H.571A.564.564 0 010 1.715V.572C0 .251.25.001.571.001h26.286c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571h-1.714zm-2.286 0H4.571c0 2.607.589 4.911 1.518 6.857h15.25c.929-1.946 1.518-4.25 1.518-6.857zM21.839 24c-1.321-3.446-3.696-5.893-6.071-6.857h-4.107c-2.375.964-4.75 3.411-6.071 6.857h16.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Hourglass2);
var _default = ForwardRef;
exports["default"] = _default;