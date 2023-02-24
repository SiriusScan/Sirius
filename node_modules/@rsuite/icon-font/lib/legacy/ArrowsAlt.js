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

function ArrowsAlt(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.911 9.661L16.572 16l6.339 6.339 2.571-2.571a1.123 1.123 0 011.25-.25c.411.179.696.589.696 1.054v8c0 .625-.518 1.143-1.143 1.143h-8c-.464 0-.875-.286-1.054-.714a1.1 1.1 0 01.25-1.232l2.571-2.571-6.339-6.339-6.339 6.339 2.571 2.571a1.1 1.1 0 01.25 1.232 1.144 1.144 0 01-1.054.714h-8a1.151 1.151 0 01-1.143-1.143v-8c0-.464.286-.875.714-1.054a1.1 1.1 0 011.232.25l2.571 2.571L10.854 16 4.515 9.661l-2.571 2.571c-.214.214-.5.339-.804.339-.143 0-.304-.036-.429-.089a1.144 1.144 0 01-.714-1.054v-8c0-.625.518-1.143 1.143-1.143h8c.464 0 .875.286 1.054.714a1.1 1.1 0 01-.25 1.232L7.373 6.802l6.339 6.339 6.339-6.339-2.571-2.571a1.1 1.1 0 01-.25-1.232 1.144 1.144 0 011.054-.714h8c.625 0 1.143.518 1.143 1.143v8c0 .464-.286.875-.696 1.054a1.316 1.316 0 01-.446.089c-.304 0-.589-.125-.804-.339z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ArrowsAlt);
var _default = ForwardRef;
exports["default"] = _default;