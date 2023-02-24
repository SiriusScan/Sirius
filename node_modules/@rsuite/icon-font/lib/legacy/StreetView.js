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

function StreetView(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 27.429c0 3.143-6.518 4.571-12.571 4.571S.001 30.571.001 27.429c0-2.429 3.625-3.571 6.661-4.089.625-.107 1.214.304 1.321.929s-.304 1.214-.929 1.321c-3.679.643-4.714 1.643-4.768 1.857.179.607 3.607 2.268 10.286 2.268s10.107-1.661 10.286-2.304c-.054-.179-1.089-1.179-4.768-1.821-.625-.107-1.036-.696-.929-1.321s.696-1.036 1.321-.929c3.036.518 6.661 1.661 6.661 4.089zm-6.857-16v6.857c0 .625-.518 1.143-1.143 1.143H16v6.857c0 .625-.518 1.143-1.143 1.143h-4.571a1.151 1.151 0 01-1.143-1.143v-6.857H8a1.151 1.151 0 01-1.143-1.143v-6.857a2.279 2.279 0 012.286-2.286H16a2.279 2.279 0 012.286 2.286zm-1.715-6.858c0 2.214-1.786 4-4 4s-4-1.786-4-4 1.786-4 4-4 4 1.786 4 4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(StreetView);
var _default = ForwardRef;
exports["default"] = _default;