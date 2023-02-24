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

function WheelchairAlt(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.679 14.518c.375.393.571.929.518 1.464l-.786 9.839c-.089 1-.911 1.75-1.893 1.75-.054 0-.107 0-.161-.018-1.054-.071-1.821-1-1.75-2.036l.625-7.661-2.554.143a9.812 9.812 0 01.982 4.286c0 2.571-1 4.911-2.643 6.643l-2.446-2.446a6.27 6.27 0 001.625-4.196c0-3.464-2.804-6.268-6.25-6.268-1.625 0-3.089.625-4.214 1.643l-2.446-2.464a9.638 9.638 0 015.071-2.518l4.714-5.357-2.661-1.554-3.232 2.875c-.786.714-1.982.643-2.679-.143s-.625-1.982.143-2.679L9.91 2.017a1.853 1.853 0 012.214-.214c8.696 5.054 8.714 5.054 8.714 5.054.464.268.732.732.857 1.214a2.312 2.312 0 01-.464 2.089l-3.661 4.143 6.625-.357a1.862 1.862 0 011.482.571zm-3.536-8.161a3.175 3.175 0 01-3.179-3.179 3.186 3.186 0 013.179-3.179 3.19 3.19 0 013.196 3.179 3.178 3.178 0 01-3.196 3.179zM10.946 28.536c1.286 0 2.5-.411 3.5-1.089l2.482 2.482A9.601 9.601 0 0110.946 32c-5.375 0-9.732-4.357-9.732-9.714 0-2.268.768-4.339 2.071-6l2.482 2.482a6.244 6.244 0 00-1.071 3.518 6.257 6.257 0 006.25 6.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(WheelchairAlt);
var _default = ForwardRef;
exports["default"] = _default;