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

function Percent(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 22.857c0-1.25-1.036-2.286-2.286-2.286s-2.286 1.036-2.286 2.286 1.036 2.286 2.286 2.286 2.286-1.036 2.286-2.286zM9.143 9.143c0-1.25-1.036-2.286-2.286-2.286S4.571 7.893 4.571 9.143s1.036 2.286 2.286 2.286 2.286-1.036 2.286-2.286zm18.286 13.714c0 3.786-3.071 6.857-6.857 6.857s-6.857-3.071-6.857-6.857S16.786 16 20.572 16s6.857 3.071 6.857 6.857zM25.714 3.429c0 .25-.089.482-.232.679L6.625 29.251a1.15 1.15 0 01-.911.464H2.857a1.151 1.151 0 01-1.143-1.143c0-.25.089-.482.232-.679L20.803 2.75a1.15 1.15 0 01.911-.464h2.857c.625 0 1.143.518 1.143 1.143zm-12 5.714c0 3.786-3.071 6.857-6.857 6.857S0 12.929 0 9.143s3.071-6.857 6.857-6.857 6.857 3.071 6.857 6.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Percent);
var _default = ForwardRef;
exports["default"] = _default;