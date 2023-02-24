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

function SingleSource(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.5 13a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 016.5 13zm0 1a.5.5 0 100 1 .5.5 0 000-1zm4.5-1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1a1 1 0 011-1h1zm0 1h-1v1h1v-1zm3.5-1a1.5 1.5 0 11-.001 3.001A1.5 1.5 0 0114.5 13zm0 1a.5.5 0 100 1 .5.5 0 000-1zM3 10h11a1 1 0 011 1H4a1 1 0 01-1-1zm1-2h8a1 1 0 01-1 1H3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 10a1 1 0 011 1v2.5a.5.5 0 01-1 0V10zM10 10h1v4h-1v-4zM6 10h1v4H6v-4zM4 8v3a1 1 0 01-1-1V9a1 1 0 011-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.433 0c.283 0 .559.094.833.309.341.339.629.657.945 1.031l.545.66H10.5c.678 0 1.409.686 1.492 1.372L12 3.5V8a1 1 0 01-1 1V3.5c0-.153-.261-.429-.438-.489L10.5 3H7.567c-.318 0-1.656-1.634-1.958-1.94a.29.29 0 00-.114-.053L5.433 1H1.3c-.14 0-.26.103-.292.244L1 1.318V7.5c0 .172.33.5.5.5a.5.5 0 010 1C.822 9 .091 8.314.008 7.628L0 7.5V1.318C0 .638.509.074 1.167.007L1.3 0h4.133z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SingleSource);
var _default = ForwardRef;
exports["default"] = _default;