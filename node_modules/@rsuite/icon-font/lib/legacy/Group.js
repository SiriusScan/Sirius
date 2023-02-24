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

function Group(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.589 16a6.32 6.32 0 00-4.732 2.286H3.464C1.678 18.286 0 17.429 0 15.447c0-1.446-.054-6.304 2.214-6.304.375 0 2.232 1.518 4.643 1.518.821 0 1.607-.143 2.375-.411a8.664 8.664 0 00-.089 1.179c0 1.625.518 3.232 1.446 4.571zm19.125 11.375c0 2.893-1.911 4.625-4.768 4.625H9.339c-2.857 0-4.768-1.732-4.768-4.625 0-4.036.946-10.232 6.179-10.232.607 0 2.821 2.482 6.393 2.482s5.786-2.482 6.393-2.482c5.232 0 6.179 6.196 6.179 10.232zM11.429 4.571c0 2.518-2.054 4.571-4.571 4.571S2.287 7.088 2.287 4.571 4.341 0 6.858 0s4.571 2.054 4.571 4.571zM24 11.429c0 3.786-3.071 6.857-6.857 6.857s-6.857-3.071-6.857-6.857 3.071-6.857 6.857-6.857S24 7.643 24 11.429zm10.286 4.017c0 1.982-1.679 2.839-3.464 2.839h-2.393a6.32 6.32 0 00-4.732-2.286 8.065 8.065 0 001.446-4.571c0-.393-.036-.786-.089-1.179a7.142 7.142 0 002.375.411c2.411 0 4.268-1.518 4.643-1.518 2.268 0 2.214 4.857 2.214 6.304zM32 4.571c0 2.518-2.054 4.571-4.571 4.571s-4.571-2.054-4.571-4.571S24.912 0 27.429 0 32 2.054 32 4.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Group);
var _default = ForwardRef;
exports["default"] = _default;