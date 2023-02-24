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

function Viadeo(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.75 19.75c0 2.554-.893 4.804-2.625 6.679-1.804 1.964-4.089 2.875-6.75 2.875-2.643 0-4.946-.893-6.75-2.875C.893 24.554 0 22.304 0 19.75c0-5.304 4-9.643 9.375-9.643 1.107 0 2.214.179 3.25.554a6.595 6.595 0 00-.696 2.25 6.584 6.584 0 00-2.554-.5c-4.054 0-7.036 3.464-7.036 7.393 0 4 2.964 7.268 7.036 7.268s7.018-3.268 7.018-7.268a7.695 7.695 0 00-.571-2.964 6.731 6.731 0 002.196-.875c.5 1.196.732 2.5.732 3.786zm-3.643-3.375c0 4.5-1.821 8.25-5.679 10.679l-.25.018c-.375 0-.75-.036-1.107-.089 5.161-1.964 6.107-9.804 6.107-14.589 0-.607 0-1.232-.054-1.839.643 1.875.982 3.839.982 5.821zm-.982-5.857v.036c-.929-2.732-2.214-5.375-3.679-7.857 2.25 1.518 3.482 5.196 3.679 7.821zm4.357 3.625c-1.107 0-2.089-.589-2.857-1.339 1.821-1 4.125-2.554 5.179-4.411.125-.25.339-.714.375-1-1.036 2.321-3.679 4.143-6.143 4.714-.393-.607-.625-1.286-.625-2.018 0-.857.429-2 1.071-2.625.732-.696 1.821-1.054 2.804-1.321 1.429-.393 2.589-1.5 3.214-2.839.929 1.321 1.321 2.929 1.321 4.518 0 .804-.125 2.268-.429 3.036-.661 1.607-2 3.286-3.911 3.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Viadeo);
var _default = ForwardRef;
exports["default"] = _default;