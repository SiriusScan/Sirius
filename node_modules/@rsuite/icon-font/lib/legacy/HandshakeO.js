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

function HandshakeO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M3.429 20.571c1.5 0 1.5-2.286 0-2.286s-1.5 2.286 0 2.286zm26.303-1.035c-1.411-1.839-2.786-3.714-4.393-5.393l-2.232 2.5c-1.964 2.232-5.482 2.179-7.393-.107-1.357-1.643-1.357-4 .036-5.625l3.161-3.679c-1.107-.571-2.446-.375-3.643-.375a4.002 4.002 0 00-2.821 1.179l-2.821 2.821H6.858v9.714c.786 0 1.5-.107 2.125.5l5.304 5.214c1.089 1.054 2.5 1.982 4.054 1.982.804 0 1.661-.268 2.232-.839 1.339.464 2.893-.286 3.304-1.661a2.873 2.873 0 002.268-.786c.411-.375.946-1.125.893-1.714.161.161.554.179.768.179 2.125 0 3.232-2.232 1.929-3.911zm2.839 1.035h1.714v-9.143h-1.661L29.82 8.214a4.048 4.048 0 00-3.018-1.357H23.82c-1 0-1.964.446-2.607 1.196l-3.732 4.339a2.08 2.08 0 00-.018 2.679c1.018 1.214 2.893 1.232 3.946.054l3.446-3.893c.821-.911 2.321-.054 1.946 1.107.679.786 1.411 1.554 2.071 2.339.893 1.107 1.75 2.268 2.625 3.393.554.714.964 1.571 1.071 2.5zm5.143 0c1.5 0 1.5-2.286 0-2.286s-1.5 2.286 0 2.286zm3.429-10.285v11.429c0 .625-.518 1.143-1.143 1.143h-7.75c-.643 1.554-2.054 2.589-3.696 2.821-.768 1.125-1.946 1.982-3.268 2.268-.982 1.25-2.571 2-4.161 1.893-2.946 1.661-6.268.214-8.464-1.946l-5.125-5.036H1.143A1.151 1.151 0 010 21.715v-12c0-.625.518-1.143 1.143-1.143h7.518c2.071-2.071 3.5-4 6.607-4h2.089c1.161 0 2.286.357 3.232 1 .946-.643 2.071-1 3.232-1h2.982c3.393 0 4.804 2.214 6.857 4.571h6.339c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandshakeO);
var _default = ForwardRef;
exports["default"] = _default;