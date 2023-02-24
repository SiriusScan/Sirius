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

function ReviewRefuse(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M1.5 15h9a.5.5 0 010 1h-9a.5.5 0 010-1zM4.863 8.921l-3.819 1.863.438.899c.196.402.935.657 1.337.46l.899-.438.438.899-.899.438c-.899.438-2.236-.022-2.674-.921l-.438-.899c-.208-.425.035-1.13.46-1.337l3.724-1.816-1.003-2.057a3 3 0 112.311-1.127l-.782-.624a2 2 0 10-1.54.751l.632-.007 1.196 2.452-.281 1.464z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11.725 5.307a5 5 0 102.807 2.579.5.5 0 11.906-.422 6.001 6.001 0 01-10.876 5.072 6.001 6.001 0 017.525-8.161l-.003.008a.5.5 0 11-.36.923z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 9.293l2.146-2.146a.5.5 0 01.707.707L10.707 10l2.146 2.146a.5.5 0 01-.707.707L10 10.707l-2.146 2.146a.5.5 0 01-.707-.707L9.293 10 7.147 7.854a.5.5 0 01.707-.707L10 9.293z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ReviewRefuse);
var _default = ForwardRef;
exports["default"] = _default;