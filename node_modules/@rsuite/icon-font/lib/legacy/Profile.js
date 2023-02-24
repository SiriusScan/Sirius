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

function Profile(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14.457 22.551H6.002c-.786-.341-1.33-.809-1.481-1.483-.448-1.968.519-5.275 2.51-5.257.683.011 1.394.725 2.171.917.77.187 1.502.183 2.169 0 .935-.254 1.319-.944 2.169-.917 2.514.091 3.559 6.199.917 6.741z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.351 13.065a3.143 3.143 0 11-6.286 0 3.143 3.143 0 016.286 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M29.961 7.074a.205.205 0 01.039.133v17.589c0 .08-.03.123-.021.133l-27.929.014c0-.002-.05-.041-.05-.149V7.208c0-.078.03-.121.021-.13l27.941-.002zm.039-2H2c-1.106 0-2 .958-2 2.13v17.589c0 1.179.894 2.133 2 2.133h28c1.106 0 2-.953 2-2.133V7.207c0-1.175-.894-2.133-2-2.133z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.75 10.928h9.246v1.998H18.75v-1.998zM18.75 15.239h9.246v2H18.75v-2zM18.75 19.552h9.246v2H18.75v-2z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Profile);
var _default = ForwardRef;
exports["default"] = _default;