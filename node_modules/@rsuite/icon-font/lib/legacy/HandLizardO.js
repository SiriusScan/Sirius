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

function HandLizardO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.554 0C22 0 23.393.696 24.25 1.875l10.214 13.946a10.73 10.73 0 012.107 6.411v6.339A3.43 3.43 0 0133.142 32h-6.857a3.43 3.43 0 01-3.429-3.429V25.41l-5.107-2.554h-9.75a3.43 3.43 0 01-3.429-3.429v-.571a5.145 5.145 0 015.143-5.143h7.5l.75-2.286H5.713a4.569 4.569 0 01-4.554-4.179 5.134 5.134 0 01-1.161-3.25v-.571A3.43 3.43 0 013.427-.002h17.125zm13.732 28.571v-6.339a8.65 8.65 0 00-1.661-5.071L22.393 3.215a2.31 2.31 0 00-1.839-.929H3.429c-.625 0-1.143.518-1.143 1.143 0 .946.018 1.607.643 2.375.232-.732.893-1.232 1.643-1.232h14.857v.571H4.572c-.625 0-1.143.518-1.143 1.143 0 .339-.018.696.054 1.036.196 1.054 1.161 1.821 2.232 1.821h13.054c.946 0 1.714.768 1.714 1.714 0 .179-.036.375-.089.536l-1.143 3.429a1.728 1.728 0 01-1.625 1.179H9.715a2.866 2.866 0 00-2.857 2.857v.571c0 .625.518 1.143 1.143 1.143h10.018c.179 0 .357.036.518.125l5.661 2.821c.571.304.946.893.946 1.536v3.518c0 .625.518 1.143 1.143 1.143h6.857c.625 0 1.143-.518 1.143-1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandLizardO);
var _default = ForwardRef;
exports["default"] = _default;