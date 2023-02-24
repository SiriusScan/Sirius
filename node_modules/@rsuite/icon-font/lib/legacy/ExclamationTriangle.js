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

function ExclamationTriangle(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 24.554v-3.393a.58.58 0 00-.571-.589h-3.429a.58.58 0 00-.571.589v3.393c0 .321.25.589.571.589h3.429a.58.58 0 00.571-.589zm-.036-6.679l.321-8.196a.432.432 0 00-.179-.339c-.107-.089-.268-.196-.429-.196h-3.929c-.161 0-.321.107-.429.196-.125.089-.179.268-.179.375l.304 8.161c0 .232.268.411.607.411h3.304c.321 0 .589-.179.607-.411zM18 1.196l13.714 25.143c.393.696.375 1.554-.036 2.25s-1.161 1.125-1.964 1.125H2.285c-.804 0-1.554-.429-1.964-1.125s-.429-1.554-.036-2.25L13.999 1.196a2.273 2.273 0 014 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ExclamationTriangle);
var _default = ForwardRef;
exports["default"] = _default;