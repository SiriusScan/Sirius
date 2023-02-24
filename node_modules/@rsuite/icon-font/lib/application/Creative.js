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

function Creative(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.337 8.994v-.001l-.005-.015-.045-.145c-.045-.145-.08-.262-.112-.374C5.058 8.049 5 7.753 5 7.501c0-1.102 1.088-1.165 2.992-.603.808-.263 1.429-.397 1.883-.397.661 0 1.125.313 1.125.921 0 .251-.058.55-.175.968l-.07.243-.088.288-.005.017-.002.006-.183.596c-.162.537-.271.947-.351 1.344a5.695 5.695 0 00-.127 1.117.5.5 0 01-1 0c0-.404.051-.839.147-1.315.087-.433.204-.871.374-1.435.394-1.305.466-1.537.48-1.682l.003-.066-.001-.032-.006.012c-.009.007-.027.013-.06.015l-.063.002c-.297 0-.76.094-1.375.285v1.321a.5.5 0 01-1 0v-1.31c-.607-.168-1.065-.246-1.359-.237-.116.004-.14-.006-.144-.024v.061l.002.044c.011.143.08.357.478 1.647.192.622.319 1.098.407 1.573.075.406.115.784.115 1.141a.5.5 0 01-1 0c0-.291-.034-.609-.098-.958-.08-.429-.197-.872-.379-1.46l-.18-.574-.003-.008-.002-.006z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 2a5 5 0 10.001 10.001A5 5 0 008 2zm0-1a6 6 0 110 12A6 6 0 018 1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 12a.5.5 0 011 0v1a3 3 0 11-6 0v-1a.5.5 0 011 0v1a2 2 0 104 0v-1zM.129.877A.5.5 0 11.831.165l1.006.993a.5.5 0 11-.702.712L.129.877zM15.132.049a.5.5 0 11.708.706l-.996.998a.5.5 0 11-.708-.706l.996-.998zM1.926 13.747a.5.5 0 01-.707-.707l1.023-1.023a.5.5 0 01.707.707l-1.023 1.023zM15.139 13.13a.5.5 0 01-.707.707l-1-1a.5.5 0 01.707-.707l1 1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Creative);
var _default = ForwardRef;
exports["default"] = _default;