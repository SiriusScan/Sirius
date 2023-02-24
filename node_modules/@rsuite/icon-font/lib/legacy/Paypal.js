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

function Paypal(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.125 11.536c.232 1.071.179 2.304-.071 3.643-1.161 5.893-5.071 7.929-10.089 7.929h-.786c-.607 0-1.107.446-1.214 1.054l-.071.339-.982 6.179-.036.268c-.125.607-.625 1.054-1.232 1.054H8.162c-.5 0-.821-.411-.75-.911.321-2 .625-4 .946-6s.643-3.982.964-5.982c.054-.429.339-.661.768-.661.714 0 1.429-.018 2.339 0 1.286.018 2.768-.054 4.214-.375 1.929-.429 3.679-1.214 5.125-2.571 1.304-1.214 2.179-2.714 2.768-4.393.268-.786.482-1.571.625-2.375.036-.214.089-.179.214-.089.982.732 1.536 1.714 1.75 2.893zM24.054 6.5c0 1.464-.339 2.857-.821 4.214-.929 2.696-2.679 4.625-5.393 5.625-1.446.518-2.964.732-4.5.75-1.071.018-2.143 0-3.214 0-1.161 0-1.893.571-2.107 1.714-.25 1.357-1.232 7.679-1.518 9.464-.018.125-.071.179-.214.179H1.019a.859.859 0 01-.857-.982L4.305 1.196A1.437 1.437 0 015.716 0h10.679c.768 0 2.536.339 3.732.804 2.536.982 3.929 2.982 3.929 5.696z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Paypal);
var _default = ForwardRef;
exports["default"] = _default;