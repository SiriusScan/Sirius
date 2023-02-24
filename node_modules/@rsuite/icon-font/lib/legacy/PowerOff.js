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

function PowerOff(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.429 16c0 7.554-6.161 13.714-13.714 13.714S.001 23.553.001 16c0-4.339 2-8.339 5.482-10.946a2.262 2.262 0 013.196.446c.768 1 .554 2.446-.446 3.196-2.321 1.75-3.661 4.411-3.661 7.304 0 5.036 4.107 9.143 9.143 9.143s9.143-4.107 9.143-9.143c0-2.893-1.339-5.554-3.661-7.304-1-.75-1.214-2.196-.446-3.196a2.263 2.263 0 013.196-.446A13.575 13.575 0 0127.429 16zM16 2.286v11.429c0 1.25-1.036 2.286-2.286 2.286s-2.286-1.036-2.286-2.286V2.286c0-1.25 1.036-2.286 2.286-2.286S16 1.036 16 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PowerOff);
var _default = ForwardRef;
exports["default"] = _default;