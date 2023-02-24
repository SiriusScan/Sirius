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

function Eye(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.714 17.143c-1.696-2.625-4.018-4.875-6.804-6.304a7.938 7.938 0 011.089 4.018c0 4.411-3.589 8-8 8s-8-3.589-8-8c0-1.411.375-2.804 1.089-4.018-2.786 1.429-5.107 3.679-6.804 6.304 3.054 4.714 7.982 8 13.714 8s10.661-3.286 13.714-8zm-12.857-6.857A.87.87 0 0016 9.429c-2.982 0-5.429 2.446-5.429 5.429 0 .464.393.857.857.857s.857-.393.857-.857c0-2.036 1.679-3.714 3.714-3.714a.87.87 0 00.857-.857zM32 17.143c0 .446-.143.857-.357 1.232-3.286 5.411-9.304 9.054-15.643 9.054S3.643 23.768.357 18.375C.143 18 0 17.589 0 17.143s.143-.857.357-1.232C3.643 10.518 9.661 6.857 16 6.857s12.357 3.661 15.643 9.054c.214.375.357.786.357 1.232z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Eye);
var _default = ForwardRef;
exports["default"] = _default;