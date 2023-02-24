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

function CharacterLock(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14 2a1 1 0 00-1-1H2a1 1 0 00-1 1v9a1 1 0 001 1h3.5a.5.5 0 010 1H2a2 2 0 01-2-2V2a2 2 0 012-2h11a2 2 0 012 2v2.5a.5.5 0 01-1 0V2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 6a1 1 0 100-2 1 1 0 000 2zm0 1a2 2 0 11-.001-3.999A2 2 0 015 7z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2 9c0-1.933 1.714-3 3-3 1.24 0 2.878.93 2.994 2.79L8 9H7c0-1.181-.966-2-2-2-.957 0-1.909.784-1.994 1.846L3 9v.5a.5.5 0 01-1 0V9zM9.5 5h2a.5.5 0 010 1h-2a.5.5 0 010-1zM9.5 3h2a.5.5 0 010 1h-2a.5.5 0 010-1zM9 11v4h6v-4H9zm0-1h6a1 1 0 011 1v4a1 1 0 01-1 1H9a1 1 0 01-1-1v-4a1 1 0 011-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 12a1 1 0 110 2 1 1 0 010-2zM13 10V8.8c0-.417-.426-.8-1-.8s-1 .383-1 .8V10h-1V8.8c0-.994.895-1.8 2-1.8s2 .806 2 1.8V10h-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CharacterLock);
var _default = ForwardRef;
exports["default"] = _default;