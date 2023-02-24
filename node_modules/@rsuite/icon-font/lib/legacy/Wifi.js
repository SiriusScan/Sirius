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

function Wifi(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 27.196c-.464 0-2.964-2.5-2.964-2.982 0-.875 2.286-1.357 2.964-1.357s2.964.482 2.964 1.357c0 .482-2.5 2.982-2.964 2.982zm4.821-4.839c-.25 0-2.196-1.786-4.821-1.786-2.643 0-4.554 1.786-4.821 1.786-.429 0-3.018-2.571-3.018-3 0-.161.071-.304.179-.411C12.537 17.053 15.644 16 18.287 16s5.75 1.054 7.661 2.946c.107.107.179.25.179.411 0 .429-2.589 3-3.018 3zm4.875-4.857a.805.805 0 01-.411-.143c-2.946-2.286-5.429-3.643-9.286-3.643-5.393 0-9.5 3.786-9.696 3.786-.411 0-2.982-2.571-2.982-3a.57.57 0 01.179-.393c3.196-3.196 8.018-4.964 12.5-4.964s9.304 1.768 12.5 4.964c.107.107.179.25.179.393 0 .429-2.571 3-2.982 3zm4.839-4.839a.638.638 0 01-.393-.161c-4.125-3.625-8.571-5.643-14.143-5.643S8.267 8.875 4.142 12.5a.644.644 0 01-.393.161c-.411 0-3-2.571-3-3 0-.161.071-.304.179-.411 4.518-4.482 11.036-6.964 17.357-6.964S31.124 4.768 35.642 9.25c.107.107.179.25.179.411 0 .429-2.589 3-3 3z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Wifi);
var _default = ForwardRef;
exports["default"] = _default;