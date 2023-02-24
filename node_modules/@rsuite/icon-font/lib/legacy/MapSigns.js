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

function MapSigns(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M31.161 5.304a.571.571 0 010 .821l-2.518 2.518c-.321.321-.768.5-1.214.5h-24A1.151 1.151 0 012.286 8V3.429c0-.625.518-1.143 1.143-1.143h10.286V1.143c0-.625.518-1.143 1.143-1.143h2.286c.625 0 1.143.518 1.143 1.143v1.143h9.143c.446 0 .893.179 1.214.5zm-17.447 16.41h4.571v9.143c0 .625-.518 1.143-1.143 1.143h-2.286a1.151 1.151 0 01-1.143-1.143v-9.143zm14.857-8c.625 0 1.143.518 1.143 1.143v4.571c0 .625-.518 1.143-1.143 1.143h-24c-.446 0-.893-.179-1.214-.5L.839 17.553a.571.571 0 010-.821l2.518-2.518c.321-.321.768-.5 1.214-.5h9.143v-3.429h4.571v3.429h10.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(MapSigns);
var _default = ForwardRef;
exports["default"] = _default;