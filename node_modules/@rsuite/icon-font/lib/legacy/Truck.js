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

function Truck(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 33 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 25.143c0-1.25-1.036-2.286-2.286-2.286s-2.286 1.036-2.286 2.286 1.036 2.286 2.286 2.286 2.286-1.036 2.286-2.286zM4.571 16h6.857v-4.571H8.607c-.071 0-.339.107-.393.161l-3.482 3.482a1.07 1.07 0 00-.161.393v.536zm22.858 9.143c0-1.25-1.036-2.286-2.286-2.286s-2.286 1.036-2.286 2.286 1.036 2.286 2.286 2.286 2.286-1.036 2.286-2.286zM32 5.714V24c0 1.321-1.393 1.143-2.286 1.143 0 2.518-2.054 4.571-4.571 4.571s-4.571-2.054-4.571-4.571h-6.857c0 2.518-2.054 4.571-4.571 4.571s-4.571-2.054-4.571-4.571H3.43c-.893 0-2.286.179-2.286-1.143 0-.625.518-1.143 1.143-1.143v-5.714c0-1.268-.179-2.679.804-3.661l3.536-3.536c.446-.446 1.304-.804 1.946-.804h2.857V5.713c0-.625.518-1.143 1.143-1.143h18.286c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Truck);
var _default = ForwardRef;
exports["default"] = _default;