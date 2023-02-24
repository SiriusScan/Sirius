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

function MortarBoard(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M31.679 14.929L32 20.572c.143 2.518-5.125 4.571-11.429 4.571S9 23.089 9.142 20.572l.321-5.643 10.25 3.232c.286.089.571.125.857.125s.571-.036.857-.125zm9.464-5.786c0 .25-.161.464-.393.554l-20 6.286c-.071.018-.125.018-.179.018s-.107 0-.179-.018L8.749 12.304c-1.018.804-1.732 2.768-1.875 5.179a2.228 2.228 0 011.125 1.946c0 .804-.411 1.5-1.036 1.911l1.036 7.732c.018.161-.036.321-.143.446s-.268.196-.429.196H3.998a.584.584 0 01-.572-.642l1.036-7.732a2.275 2.275 0 01-1.036-1.911c0-.857.482-1.589 1.161-1.982.107-2.089.643-4.339 1.75-5.893L.391 9.697c-.232-.089-.393-.304-.393-.554s.161-.464.393-.554l20-6.286c.071-.018.125-.018.179-.018s.107 0 .179.018l20 6.286a.598.598 0 01.393.554z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(MortarBoard);
var _default = ForwardRef;
exports["default"] = _default;