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

function Paw(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.929 8.429c0 2-1.036 4.375-3.339 4.375-2.893 0-4.643-3.643-4.643-6.143 0-2 1.036-4.375 3.339-4.375 2.911 0 4.643 3.643 4.643 6.143zm-6.108 8.625c0 1.732-.911 3.536-2.875 3.536C2.089 20.59 0 17.09 0 14.501c0-1.732.929-3.554 2.875-3.554 2.857 0 4.946 3.518 4.946 6.107zm7.036-.483c4.375 0 10.286 6.304 10.286 10.518 0 2.268-1.857 2.625-3.679 2.625-2.393 0-4.321-1.607-6.607-1.607-2.393 0-4.429 1.589-7.018 1.589-1.732 0-3.268-.589-3.268-2.607 0-4.232 5.911-10.518 10.286-10.518zm4.268-3.767c-2.304 0-3.339-2.375-3.339-4.375 0-2.5 1.732-6.143 4.643-6.143 2.304 0 3.339 2.375 3.339 4.375 0 2.5-1.75 6.143-4.643 6.143zm7.714-1.858c1.946 0 2.875 1.821 2.875 3.554 0 2.589-2.089 6.089-4.946 6.089-1.964 0-2.875-1.804-2.875-3.536 0-2.589 2.089-6.107 4.946-6.107z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Paw);
var _default = ForwardRef;
exports["default"] = _default;