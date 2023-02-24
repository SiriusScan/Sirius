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

function Mixcloud(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.375 19.607c0-1.429-.911-2.643-2.161-3.125a10.446 10.446 0 01-.411 1.643 1.34 1.34 0 01-1.286.929c-.143 0-.286-.018-.429-.054a1.374 1.374 0 01-.875-1.732 8.217 8.217 0 00.411-2.554c0-4.464-3.643-8.107-8.125-8.107a8.132 8.132 0 00-7.393 4.768 7.42 7.42 0 013.357 1.893c.536.536.536 1.411 0 1.946s-1.411.536-1.946 0a4.527 4.527 0 00-3.214-1.339c-2.518 0-4.571 2.036-4.571 4.554s2.054 4.554 4.571 4.554h18.679c1.875 0 3.393-1.518 3.393-3.375zm2.732 0c0 3.375-2.75 6.107-6.125 6.107H7.303c-4.036 0-7.304-3.268-7.304-7.286 0-3.661 2.714-6.679 6.232-7.196 1.482-4.357 5.607-7.357 10.268-7.357 5.625 0 10.268 4.304 10.804 9.786 2.732.589 4.804 3.036 4.804 5.946zm4.464 0c0 2.036-.589 4-1.732 5.696a1.358 1.358 0 01-1.143.589c-.268 0-.536-.071-.768-.232a1.352 1.352 0 01-.357-1.893 7.327 7.327 0 001.268-4.161 7.369 7.369 0 00-1.268-4.161c-.429-.625-.268-1.464.357-1.893s1.482-.25 1.911.375a10.037 10.037 0 011.732 5.679zm4.572 0c0 2.839-.821 5.571-2.393 7.911a1.376 1.376 0 01-1.143.607 1.32 1.32 0 01-.75-.232c-.625-.429-.804-1.268-.375-1.893 1.25-1.893 1.929-4.107 1.929-6.393s-.679-4.5-1.929-6.375a1.356 1.356 0 01.375-1.893 1.344 1.344 0 011.893.375c1.571 2.321 2.393 5.054 2.393 7.893z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Mixcloud);
var _default = ForwardRef;
exports["default"] = _default;