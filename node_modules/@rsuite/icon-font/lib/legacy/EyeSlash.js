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

function EyeSlash(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.911 23.839l1.393-2.518A7.997 7.997 0 018 14.857c0-1.411.375-2.804 1.089-4.018-2.786 1.429-5.107 3.679-6.804 6.304 1.857 2.875 4.482 5.286 7.625 6.696zm6.946-13.553A.87.87 0 0016 9.429c-2.982 0-5.429 2.446-5.429 5.429 0 .464.393.857.857.857s.857-.393.857-.857a3.723 3.723 0 013.714-3.714.87.87 0 00.857-.857zm6.482-3.411c0 .036 0 .125-.018.161-3.768 6.732-7.5 13.5-11.268 20.232l-.875 1.589a.592.592 0 01-.5.286c-.321 0-2.018-1.036-2.393-1.25a.57.57 0 01-.286-.5c0-.286.607-1.25.786-1.554-3.464-1.571-6.375-4.25-8.429-7.464a2.304 2.304 0 010-2.464c3.536-5.429 9.054-9.054 15.643-9.054 1.071 0 2.161.107 3.214.304l.964-1.732a.57.57 0 01.5-.286c.321 0 2 1.036 2.375 1.25a.562.562 0 01.286.482zM24 14.857a7.99 7.99 0 01-5.143 7.464l5-8.964c.089.5.143 1 .143 1.5zm8 2.286c0 .464-.125.839-.357 1.232-.554.911-1.25 1.786-1.946 2.589-3.5 4.018-8.321 6.464-13.696 6.464l1.321-2.357c5.196-.446 9.607-3.607 12.393-7.929-1.321-2.054-3.018-3.857-5.036-5.25l1.125-2c2.214 1.482 4.446 3.714 5.839 6.018.232.393.357.768.357 1.232z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(EyeSlash);
var _default = ForwardRef;
exports["default"] = _default;