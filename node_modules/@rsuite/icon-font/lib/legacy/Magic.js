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

function Magic(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M21.25 10.375l5.232-5.232-1.911-1.911-5.232 5.232zm7.982-5.232c0 .304-.107.589-.321.804L5.947 28.911c-.214.214-.5.321-.804.321s-.589-.107-.804-.321L.803 25.375c-.214-.214-.321-.5-.321-.804s.107-.589.321-.804L23.767.803c.214-.214.5-.321.804-.321s.589.107.804.321l3.536 3.536c.214.214.321.5.321.804zM5.107 1.75l1.75.536-1.75.536-.536 1.75-.536-1.75-1.75-.536 1.75-.536L4.571 0zm6.25 2.893l3.5 1.071-3.5 1.071-1.071 3.5-1.071-3.5-3.5-1.071 3.5-1.071 1.071-3.5zm16.607 8.536l1.75.536-1.75.536-.536 1.75-.536-1.75-1.75-.536 1.75-.536.536-1.75zM16.536 1.75l1.75.536-1.75.536L16 4.572l-.536-1.75-1.75-.536 1.75-.536L16 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Magic);
var _default = ForwardRef;
exports["default"] = _default;