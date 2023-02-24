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

function Github(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.714 2.286c7.571 0 13.714 6.143 13.714 13.714 0 6.054-3.929 11.196-9.375 13.018-.696.125-.946-.304-.946-.661 0-.446.018-1.929.018-3.768 0-1.286-.429-2.107-.929-2.536 3.054-.339 6.268-1.5 6.268-6.768 0-1.5-.536-2.714-1.411-3.679.143-.357.607-1.75-.143-3.643-1.143-.357-3.768 1.411-3.768 1.411a12.895 12.895 0 00-6.858 0S7.659 7.606 6.516 7.963c-.75 1.893-.286 3.286-.143 3.643-.875.964-1.411 2.179-1.411 3.679 0 5.25 3.196 6.429 6.25 6.768-.393.357-.75.964-.875 1.839-.786.357-2.786.964-3.982-1.143-.75-1.304-2.107-1.411-2.107-1.411-1.339-.018-.089.839-.089.839.893.411 1.518 2 1.518 2 .804 2.446 4.625 1.625 4.625 1.625 0 1.143.018 2.214.018 2.554 0 .357-.25.786-.946.661-5.446-1.821-9.375-6.964-9.375-13.018 0-7.571 6.143-13.714 13.714-13.714zM5.196 21.982c.036-.071-.018-.161-.125-.214-.107-.036-.196-.018-.232.036-.036.071.018.161.125.214.089.054.196.036.232-.036zm.554.607c.071-.054.054-.179-.036-.286-.089-.089-.214-.125-.286-.054-.071.054-.054.179.036.286.089.089.214.125.286.054zm.536.804c.089-.071.089-.214 0-.339-.071-.125-.214-.179-.304-.107-.089.054-.089.196 0 .321s.232.179.304.125zm.75.75c.071-.071.036-.232-.071-.339-.125-.125-.286-.143-.357-.054-.089.071-.054.232.071.339.125.125.286.143.357.054zm1.018.446c.036-.107-.071-.232-.232-.286-.143-.036-.304.018-.339.125s.071.232.232.268c.143.054.304 0 .339-.107zm1.125.09c0-.125-.143-.214-.304-.196-.161 0-.286.089-.286.196 0 .125.125.214.304.196.161 0 .286-.089.286-.196zm1.035-.179c-.018-.107-.161-.179-.321-.161-.161.036-.268.143-.25.268.018.107.161.179.321.143s.268-.143.25-.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Github);
var _default = ForwardRef;
exports["default"] = _default;