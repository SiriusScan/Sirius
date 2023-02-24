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

function BtnOff(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M30.503 5.559H1.493C.668 5.559 0 6.226 0 7.052v17.897c0 .823.667 1.493 1.493 1.493H30.51c.825 0 1.493-.667 1.493-1.493V7.052a1.496 1.496 0 00-1.499-1.493zm-4.471 18.132a.748.748 0 01-.745.745H2.75a.747.747 0 01-.745-.745V8.31c0-.414.331-.745.745-.745h22.537c.409 0 .745.331.745.745v15.381z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.747 12.754c-.754-.779-1.762-1.17-3.022-1.17-.697 0-1.31.112-1.84.336-.4.169-.768.425-1.104.773a3.995 3.995 0 00-.793 1.173c-.258.59-.391 1.319-.391 2.187 0 1.362.375 2.427 1.125 3.202.747.777 1.758 1.163 3.026 1.163 1.255 0 2.256-.391 3.008-1.168s1.125-1.858 1.125-3.237c0-1.39-.379-2.478-1.134-3.259zm-3.003 5.692c-.542 0-.976-.19-1.33-.583-.357-.405-.537-1.031-.537-1.865 0-.853.178-1.481.526-1.874.336-.377.777-.562 1.344-.562s1.003.181 1.337.551c.343.384.517 1.01.517 1.858-.002.862-.183 1.499-.537 1.895-.347.391-.777.581-1.319.581zM12.958 20.272h2.041v-3.248h3.248v-1.826h-3.248v-1.637h3.289v-1.833h-5.33zM19.239 20.272h2.034v-3.248h3.257v-1.826h-3.257v-1.637h3.278v-1.833h-5.312z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(BtnOff);
var _default = ForwardRef;
exports["default"] = _default;