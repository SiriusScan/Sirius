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

function VolumeControlPhone(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.018 30.161c0-.429-.946-3.464-1.143-4.179-.107-.446-.143-1.179-.482-1.5-.232-.214-.607-.25-.911-.25-.839 0-1.679.196-2.518.196-.25 0-.625-.018-.839-.196-.286-.232-.429-1.036-.536-1.393-.429-1.482-.661-3-.661-4.554s.232-3.071.661-4.554c.107-.357.25-1.161.536-1.393.214-.179.589-.196.839-.196.839 0 1.679.196 2.518.196.304 0 .679-.036.911-.25.339-.321.375-1.054.482-1.5.196-.714 1.143-3.75 1.143-4.179 0-.607-1.607-1.5-2.125-1.696a2.13 2.13 0 00-.804-.143c-.589 0-1.179.161-1.75.321-2.929.875-3.625 2.661-4.786 5.179-1.25 2.696-1.554 5.268-1.554 8.214s.304 5.518 1.554 8.214c1.161 2.518 1.857 4.304 4.786 5.179.571.161 1.161.321 1.75.321.268 0 .536-.036.804-.143.518-.196 2.125-1.089 2.125-1.696zm2.839-16.304c-.304 0-.589-.125-.804-.339-.446-.446-.464-1.179 0-1.625.429-.429.661-1 .661-1.607s-.232-1.179-.661-1.625c-.464-.446-.446-1.161 0-1.607s1.161-.446 1.607 0a4.568 4.568 0 010 6.464 1.203 1.203 0 01-.804.339zm3.232 3.232c-.304 0-.589-.107-.804-.339a1.132 1.132 0 010-1.607c1.286-1.304 2-3.018 2-4.857s-.714-3.554-2-4.857c-.446-.446-.446-1.161 0-1.607s1.161-.446 1.607 0c1.732 1.732 2.679 4.018 2.679 6.464s-.946 4.732-2.679 6.464a1.095 1.095 0 01-.804.339zm3.232 3.232c-.304 0-.589-.107-.804-.339a1.132 1.132 0 010-1.607c2.143-2.161 3.339-5.036 3.339-8.089s-1.196-5.929-3.339-8.089c-.446-.446-.446-1.161 0-1.607s1.161-.446 1.607 0c2.589 2.589 4.018 6.036 4.018 9.696s-1.429 7.107-4.018 9.696a1.095 1.095 0 01-.804.339z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(VolumeControlPhone);
var _default = ForwardRef;
exports["default"] = _default;