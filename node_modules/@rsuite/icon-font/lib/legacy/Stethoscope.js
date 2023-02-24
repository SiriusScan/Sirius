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

function Stethoscope(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 12.571c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143.518 1.143 1.143 1.143 1.143-.518 1.143-1.143zm2.286 0c0 1.5-.946 2.75-2.286 3.232v7.054c0 3.786-3.589 6.857-8 6.857s-8-3.071-8-6.857V20.5C2.982 20.018 0 17.161 0 13.714V4.571c0-.625.518-1.143 1.143-1.143.107 0 .196.018.286.036a2.307 2.307 0 012-1.179c1.268 0 2.286 1.018 2.286 2.286S4.697 6.857 3.429 6.857c-.411 0-.804-.125-1.143-.321v7.179c0 2.518 2.571 4.571 5.714 4.571s5.714-2.054 5.714-4.571V6.536a2.296 2.296 0 01-1.143.321c-1.268 0-2.286-1.018-2.286-2.286s1.018-2.286 2.286-2.286c.857 0 1.607.482 2 1.179.089-.018.179-.036.286-.036.625 0 1.143.518 1.143 1.143v9.143c0 3.446-2.982 6.304-6.857 6.786v2.357c0 2.518 2.571 4.571 5.714 4.571s5.714-2.054 5.714-4.571v-7.054c-1.339-.482-2.286-1.732-2.286-3.232a3.43 3.43 0 016.858 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Stethoscope);
var _default = ForwardRef;
exports["default"] = _default;