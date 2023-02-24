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

function FileCodeO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.214 6.786c.661.661 1.214 1.982 1.214 2.929v20.571c0 .946-.768 1.714-1.714 1.714h-24A1.715 1.715 0 010 30.286V1.715C0 .769.768.001 1.714.001h16c.946 0 2.268.554 2.929 1.214zm-7.928-4.357v6.714H25c-.107-.304-.268-.607-.393-.732l-5.589-5.589c-.125-.125-.429-.286-.732-.393zm6.857 27.285V11.428h-7.429A1.715 1.715 0 0116 9.714V2.285H2.286v27.429h22.857zm-16.572-16a.571.571 0 01.804-.107l.911.679c.25.196.304.554.107.804l-3.25 4.339 3.25 4.339a.572.572 0 01-.107.804l-.911.679a.572.572 0 01-.804-.107l-4.036-5.375a.591.591 0 010-.679zm14.322 5.375a.591.591 0 010 .679l-4.036 5.375a.571.571 0 01-.804.107l-.911-.679a.571.571 0 01-.107-.804l3.25-4.339-3.25-4.339a.572.572 0 01.107-.804l.911-.679a.572.572 0 01.804.107zm-11.072 8.232a.567.567 0 01-.464-.661l2.464-14.839a.567.567 0 01.661-.464l1.125.179a.567.567 0 01.464.661l-2.464 14.839a.567.567 0 01-.661.464z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FileCodeO);
var _default = ForwardRef;
exports["default"] = _default;