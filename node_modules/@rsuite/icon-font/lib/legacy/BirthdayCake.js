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

function BirthdayCake(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M32 25.143V32H0v-6.857c1.75 0 2.679-.786 3.411-1.411.607-.536 1.018-.875 1.929-.875s1.304.339 1.929.875c.732.625 1.643 1.411 3.411 1.411 1.75 0 2.661-.786 3.411-1.411.607-.536 1-.875 1.911-.875s1.321.339 1.929.875c.732.625 1.661 1.411 3.411 1.411s2.679-.786 3.411-1.411c.607-.536 1.018-.875 1.929-.875.893 0 1.304.339 1.911.875.732.625 1.661 1.411 3.411 1.411zm0-5.714v3.429c-.911 0-1.304-.339-1.929-.875-.732-.625-1.643-1.411-3.393-1.411-1.768 0-2.679.786-3.411 1.411-.625.536-1.018.875-1.929.875s-1.321-.339-1.929-.875c-.732-.625-1.643-1.411-3.411-1.411-1.75 0-2.661.786-3.411 1.411-.607.536-1 .875-1.911.875s-1.321-.339-1.929-.875c-.732-.625-1.661-1.411-3.411-1.411-1.768 0-2.679.786-3.411 1.411-.607.536-1.018.875-1.929.875v-3.429A3.43 3.43 0 013.425 16h1.143V8h4.571v8h4.571V8h4.571v8h4.571V8h4.571v8h1.143a3.43 3.43 0 013.429 3.429zM9.143 4c0 1.893-1.018 2.857-2.286 2.857S4.571 5.839 4.571 4.571c0-2.214 2.286-1.643 2.286-4.571.857 0 2.286 2.107 2.286 4zm9.143 0c0 1.893-1.018 2.857-2.286 2.857s-2.286-1.018-2.286-2.286C13.714 2.357 16 2.928 16 0c.857 0 2.286 2.107 2.286 4zm9.143 0c0 1.893-1.018 2.857-2.286 2.857s-2.286-1.018-2.286-2.286c0-2.214 2.286-1.643 2.286-4.571.857 0 2.286 2.107 2.286 4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(BirthdayCake);
var _default = ForwardRef;
exports["default"] = _default;