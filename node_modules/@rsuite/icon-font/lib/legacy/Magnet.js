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

function Magnet(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.429 14.857v2.286c0 7.286-5.768 12.571-13.714 12.571S.001 24.428.001 17.143v-2.286c0-.625.518-1.143 1.143-1.143h6.857c.625 0 1.143.518 1.143 1.143v2.286c0 3.268 3.804 3.429 4.571 3.429s4.571-.161 4.571-3.429v-2.286c0-.625.518-1.143 1.143-1.143h6.857c.625 0 1.143.518 1.143 1.143zM9.143 3.429v6.857c0 .625-.518 1.143-1.143 1.143H1.143A1.151 1.151 0 010 10.286V3.429c0-.625.518-1.143 1.143-1.143H8c.625 0 1.143.518 1.143 1.143zm18.286 0v6.857c0 .625-.518 1.143-1.143 1.143h-6.857a1.151 1.151 0 01-1.143-1.143V3.429c0-.625.518-1.143 1.143-1.143h6.857c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Magnet);
var _default = ForwardRef;
exports["default"] = _default;