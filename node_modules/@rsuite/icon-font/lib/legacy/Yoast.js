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

function Yoast(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.054 3.893h12.339l-.464 1.286H6.054c-2.625 0-4.768 2.161-4.768 4.786v13.768c0 2.25 1.607 4.232 3.821 4.696.571.125 1.161.089 1.75.089v1.286h-.804c-3.339 0-6.054-2.732-6.054-6.071V9.965c0-3.339 2.714-6.071 6.054-6.071zM21.25 0h4.411l-8.607 23.107C15.447 27.393 13.5 31.857 8.215 32v-3.482c1.982-.321 3.25-1.411 3.929-3.25.232-.607.357-1.232.357-1.875s-.125-1.286-.357-1.893L7.055 8.411h4.071l3.339 10.446zm8.464 9.964v19.839H15.518c.286-.429.589-.839.804-1.304h12.107V9.963a4.82 4.82 0 00-3.196-4.536l.446-1.196c2.429.821 4.036 3.179 4.036 5.732z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Yoast);
var _default = ForwardRef;
exports["default"] = _default;