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

function Expand(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.482 18.857a.612.612 0 01-.179.411l-5.929 5.929 2.571 2.571c.214.214.339.5.339.804 0 .625-.518 1.143-1.143 1.143h-8a1.151 1.151 0 01-1.143-1.143v-8c0-.625.518-1.143 1.143-1.143.304 0 .589.125.804.339l2.571 2.571 5.929-5.929c.107-.107.268-.179.411-.179s.304.071.411.179l2.036 2.036a.617.617 0 01.179.411zM27.429 3.429v8c0 .625-.518 1.143-1.143 1.143-.304 0-.589-.125-.804-.339l-2.571-2.571-5.929 5.929c-.107.107-.268.179-.411.179s-.304-.071-.411-.179l-2.036-2.036c-.107-.107-.179-.268-.179-.411s.071-.304.179-.411l5.929-5.929-2.571-2.571a1.137 1.137 0 01-.339-.804c0-.625.518-1.143 1.143-1.143h8c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Expand);
var _default = ForwardRef;
exports["default"] = _default;