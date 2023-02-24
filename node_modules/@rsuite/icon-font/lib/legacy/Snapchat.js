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

function Snapchat(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.839 20.5a.465.465 0 00-.393-.482c-1.625-.357-2.857-1.482-3.536-2.982-.054-.143-.125-.286-.125-.446 0-.804 2.232-.643 2.232-1.786 0-.482-.589-.786-1.018-.786-.411 0-.732.286-1.125.286a.888.888 0 01-.214-.036c.036-.679.089-1.357.089-2.036 0-.625-.036-1.482-.304-2.036-.857-1.857-2.518-2.946-4.554-2.946-2.232 0-3.929.821-4.911 2.946-.268.554-.304 1.411-.304 2.036 0 .679.054 1.357.089 2.036-.071.036-.161.036-.25.036-.411 0-.732-.268-1.107-.268-.446 0-1 .286-1 .786 0 1.107 2.232.964 2.232 1.768 0 .161-.071.304-.125.446-.696 1.5-1.893 2.625-3.536 2.982a.465.465 0 00-.393.482c0 .821 1.893 1.125 2.446 1.214.161.429.089 1.179.732 1.179.446 0 .893-.161 1.375-.161 1.875 0 2.375 1.696 4.554 1.696 2.268 0 2.696-1.696 4.589-1.696.482 0 .929.143 1.393.143.625 0 .554-.75.714-1.161.554-.089 2.446-.393 2.446-1.214zm4.59-4.5c0 7.571-6.143 13.714-13.714 13.714S.001 23.571.001 16 6.144 2.286 13.715 2.286 27.429 8.429 27.429 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Snapchat);
var _default = ForwardRef;
exports["default"] = _default;