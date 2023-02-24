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

function Bicycle(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.607 20.571H8c-.946 0-1.482-1.071-.911-1.821l3.357-4.482A5.649 5.649 0 008 13.714c-3.143 0-5.714 2.571-5.714 5.714S4.857 25.142 8 25.142a5.727 5.727 0 005.607-4.571zm-3.321-2.285h3.321a5.735 5.735 0 00-1.339-2.643zm8.571 0L24 11.429h-8.571l-1.768 2.357a7.865 7.865 0 012.25 4.5h2.946zm20 1.143c0-3.143-2.571-5.714-5.714-5.714-.768 0-1.482.161-2.161.429l3.107 4.643c.357.536.214 1.25-.304 1.589a1.086 1.086 0 01-.643.196c-.375 0-.732-.179-.946-.518l-3.107-4.643a5.714 5.714 0 00-1.661 4.018c0 3.143 2.571 5.714 5.714 5.714s5.714-2.571 5.714-5.714zm2.286 0c0 4.411-3.589 8-8 8s-8-3.589-8-8a7.999 7.999 0 012.661-5.946l-1.161-1.75-6.304 8.375a1.1 1.1 0 01-.911.464H15.91c-.554 3.875-3.875 6.857-7.911 6.857-4.411 0-8-3.589-8-8s3.589-8 8-8c1.393 0 2.696.357 3.839.982l2.446-3.268h-4c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143h6.857v2.286h7.768l-1.518-2.286h-3.964c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143h4.571c.375 0 .732.196.946.5l4.768 7.143a7.86 7.86 0 013.429-.786c4.411 0 8 3.589 8 8z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Bicycle);
var _default = ForwardRef;
exports["default"] = _default;