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

function Android(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.804 8.625a.696.696 0 000-1.392c-.375 0-.679.321-.679.696s.304.696.679.696zm7.535 0c.375 0 .679-.321.679-.696s-.304-.696-.679-.696a.696.696 0 000 1.392zm-14.5 3.286c1 0 1.821.821 1.821 1.821v7.679c0 1.018-.804 1.839-1.821 1.839S0 22.429 0 21.411v-7.679c0-1 .821-1.821 1.839-1.821zm18.929.339v11.893a1.955 1.955 0 01-1.946 1.964h-1.339v4.054c0 1.018-.821 1.839-1.839 1.839s-1.839-.821-1.839-1.839v-4.054h-2.464v4.054A1.836 1.836 0 019.502 32c-1 0-1.821-.821-1.821-1.839l-.018-4.054H6.342a1.959 1.959 0 01-1.964-1.964V12.25h16.393zm-4.143-7.232c2.5 1.286 4.196 3.75 4.196 6.589H4.303c0-2.839 1.696-5.304 4.214-6.589L7.249 2.679a.26.26 0 01.089-.357c.125-.054.286-.018.357.107l1.286 2.357c1.089-.482 2.304-.75 3.589-.75s2.5.268 3.589.75l1.286-2.357c.071-.125.232-.161.357-.107a.26.26 0 01.089.357zm8.518 8.714v7.679a1.836 1.836 0 01-1.839 1.839c-1 0-1.821-.821-1.821-1.839v-7.679c0-1.018.821-1.821 1.821-1.821 1.018 0 1.839.804 1.839 1.821z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Android);
var _default = ForwardRef;
exports["default"] = _default;