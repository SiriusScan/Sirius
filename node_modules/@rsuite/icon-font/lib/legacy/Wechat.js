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
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.357 8.232c0-.982-.643-1.625-1.625-1.625-.964 0-1.946.643-1.946 1.625 0 .964.982 1.607 1.946 1.607.982 0 1.625-.643 1.625-1.607zm13.268 9.054c0-.643-.643-1.286-1.625-1.286-.643 0-1.286.643-1.286 1.286 0 .661.643 1.304 1.286 1.304.982 0 1.625-.643 1.625-1.304zm-4.214-9.054c0-.982-.643-1.625-1.607-1.625-.982 0-1.946.643-1.946 1.625 0 .964.964 1.607 1.946 1.607.964 0 1.607-.643 1.607-1.607zm11.339 9.054c0-.643-.661-1.286-1.625-1.286-.643 0-1.286.643-1.286 1.286 0 .661.643 1.304 1.286 1.304.964 0 1.625-.643 1.625-1.304zM26 10.196a9.521 9.521 0 00-1.25-.071c-6.143 0-11 4.589-11 10.232 0 .946.143 1.857.411 2.714a13.71 13.71 0 01-1.214.054c-1.625 0-2.911-.321-4.536-.643L3.893 24.75l1.286-3.893C1.947 18.589 0 15.661 0 12.107c0-6.161 5.821-11 12.946-11 6.357 0 11.946 3.875 13.054 9.089zm10.571 10.018c0 2.911-1.929 5.5-4.536 7.446l.982 3.232-3.554-1.946c-1.304.321-2.607.661-3.893.661-6.161 0-11-4.214-11-9.393s4.839-9.393 11-9.393c5.821 0 11 4.214 11 9.393z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Wechat);
var _default = ForwardRef;
exports["default"] = _default;