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

function Gavel(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M31.625 27.429c0 .607-.25 1.196-.661 1.607l-1.911 1.929c-.429.411-1.018.661-1.625.661s-1.196-.25-1.607-.661l-6.482-6.5a2.24 2.24 0 01-.679-1.607c0-.679.286-1.232.768-1.714l-4.571-4.571-2.25 2.25c-.161.161-.375.25-.607.25s-.446-.089-.607-.25c.536.536 1.036.929 1.036 1.75 0 .464-.179.875-.5 1.214-.607.643-1.25 1.5-2.214 1.5-.446 0-.893-.179-1.214-.5l-7.286-7.286a1.733 1.733 0 01-.5-1.214c0-.964.857-1.607 1.5-2.214.339-.321.75-.5 1.214-.5.821 0 1.214.5 1.75 1.036-.161-.161-.25-.375-.25-.607s.089-.446.25-.607l6.214-6.214c.161-.161.375-.25.607-.25s.446.089.607.25c-.536-.536-1.036-.929-1.036-1.75 0-.464.179-.875.5-1.214.607-.643 1.25-1.5 2.214-1.5.446 0 .893.179 1.214.5l7.286 7.286c.321.321.5.768.5 1.214 0 .964-.857 1.607-1.5 2.214-.339.321-.75.5-1.214.5-.821 0-1.214-.5-1.75-1.036.161.161.25.375.25.607s-.089.446-.25.607l-2.25 2.25 4.571 4.571c.482-.482 1.036-.768 1.714-.768.607 0 1.196.25 1.625.661l6.482 6.482c.411.429.661 1.018.661 1.625z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Gavel);
var _default = ForwardRef;
exports["default"] = _default;