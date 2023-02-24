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
    d: "M6 7.5v.022c-.002-.006 0-.013 0-.022zm.478 1.786c.192.622.319 1.098.407 1.573.075.406.115.784.115 1.141a.5.5 0 01-1 0c0-.291-.034-.609-.098-.958-.08-.429-.197-.872-.379-1.46l-.186-.593c-.07-.223-.118-.381-.161-.53-.117-.41-.175-.706-.175-.958 0-1.131 1.147-1.167 3.146-.557l.354.108v2.055a.5.5 0 01-1 0v-1.31c-.607-.168-1.065-.246-1.359-.237-.139.004-.147-.011-.143-.036.001.222-.023.134.48 1.763zM5.339 9l-.003-.01.003.01z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.005 7.455c-.002-.01-.005-.021-.005-.034v.031l.005.002zM9.521 9.25c-.17.564-.287 1.002-.374 1.435A6.67 6.67 0 009 12a.5.5 0 001 0c0-.331.044-.701.127-1.117.08-.397.189-.807.351-1.344l.186-.608c.07-.228.118-.39.16-.542.116-.418.175-.716.175-.968 0-.608-.464-.921-1.125-.921-.483 0-1.154.151-2.035.447l-.34.115v2.044a.5.5 0 001 0V7.785c.615-.191 1.078-.285 1.375-.285.127 0 .135-.017.13-.045-.002.211.014.147-.484 1.795zm1.141-.307l.003-.01-.003.01z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 2a5 5 0 10.001 10.001A5 5 0 008 2zm0-1a6 6 0 110 12A6 6 0 018 1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 12a.5.5 0 011 0v1a3 3 0 11-6 0v-1a.5.5 0 011 0v1a2 2 0 104 0v-1zM.13.877A.5.5 0 11.832.165l1.006.993a.5.5 0 11-.702.712L.13.877zM15.132.049a.5.5 0 11.708.706l-.996.998a.5.5 0 11-.708-.706l.996-.998zM1.926 13.747a.5.5 0 01-.707-.707l1.023-1.023a.5.5 0 01.707.707l-1.023 1.023zM15.14 13.13a.5.5 0 01-.707.707l-1-1a.5.5 0 01.707-.707l1 1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Creative);
var _default = ForwardRef;
exports["default"] = _default;