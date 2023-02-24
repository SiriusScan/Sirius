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

function Ge(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.607 29.25v1.179a14.507 14.507 0 01-11.929-6.875l1.036-.607a12.49 12.49 0 001.304 1.768l1.161-1.018a11.79 11.79 0 006.571 3.786l-.304 1.536c.696.125 1.429.214 2.161.232zM4.929 19.786l-1.482.5c.25.696.536 1.357.875 2l-1.018.589c-1.107-2.036-1.75-4.393-1.75-6.875s.643-4.839 1.75-6.875l1.018.589a12.582 12.582 0 00-.875 2l1.464.5C4.5 13.393 4.286 14.678 4.286 16s.232 2.607.643 3.786zm22.357 3.16l1.036.607a14.506 14.506 0 01-11.929 6.875v-1.179a14.318 14.318 0 002.161-.232l-.304-1.536a11.786 11.786 0 006.571-3.786l1.161 1.018c.482-.554.929-1.143 1.304-1.768zm-2.697-9.892l-4.161 1.429a4.737 4.737 0 010 3.036l4.143 1.429a8.805 8.805 0 01-1.75 3.018l-3.304-2.893a4.658 4.658 0 01-2.625 1.518l.857 4.304c-.554.107-1.143.179-1.75.179s-1.196-.071-1.75-.179l.857-4.304a4.658 4.658 0 01-2.625-1.518l-3.304 2.893a8.805 8.805 0 01-1.75-3.018l4.143-1.429a4.737 4.737 0 010-3.036l-4.161-1.429a9.148 9.148 0 011.768-3.018l3.304 2.893a4.688 4.688 0 012.625-1.536l-.857-4.286c.554-.125 1.143-.179 1.75-.179s1.196.054 1.75.179l-.857 4.286a4.683 4.683 0 012.625 1.536l3.304-2.893a9.148 9.148 0 011.768 3.018zM15.607 1.571V2.75c-.732.018-1.464.089-2.161.232l.304 1.536a11.658 11.658 0 00-6.571 3.768l-1.161-1a12.77 12.77 0 00-1.304 1.75l-1.018-.589a14.432 14.432 0 0111.911-6.875zM30.446 16c0 2.482-.643 4.839-1.75 6.875l-1.018-.589c.339-.643.625-1.304.875-2l-1.482-.5c.411-1.179.643-2.464.643-3.786s-.214-2.607-.625-3.786l1.464-.5a12.582 12.582 0 00-.875-2l1.018-.589A14.401 14.401 0 0130.446 16zm-2.142-7.554l-1.018.589a12.69 12.69 0 00-1.304-1.75l-1.161 1a11.66 11.66 0 00-6.571-3.768l.304-1.536a12.312 12.312 0 00-2.161-.232V1.57a14.432 14.432 0 0111.911 6.875zM31.214 16C31.214 7.607 24.393.786 16 .786S.786 7.607.786 16 7.607 31.214 16 31.214 31.214 24.393 31.214 16zM32 16c0 8.839-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0s16 7.161 16 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Ge);
var _default = ForwardRef;
exports["default"] = _default;