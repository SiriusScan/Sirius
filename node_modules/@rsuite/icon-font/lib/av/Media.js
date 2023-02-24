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

function Media(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M3 1v8h2v1H2a2 2 0 01-2-2V2a2 2 0 012-2h8a2 2 0 012 2v4h-1V4h-1v2H9V1H3zM2 7H1v1a1 1 0 001 1V7zm0-3H1v2h1V4zm0-3l-.117.007A1 1 0 001 2v1h1V1zm8 2h1V2a1 1 0 00-1-1v2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 5a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h8zM8 9.707l-3 2.999V14a1 1 0 001 1h8a1 1 0 001-1v-1.293l-1-1-1.646 1.646a.5.5 0 01-.707 0L8.001 9.707zM14 6H6a1 1 0 00-1 1v4.292l2.646-2.646a.5.5 0 01.707 0l3.646 3.646 1.646-1.646a.5.5 0 01.707 0l.646.647V7a1 1 0 00-1-1zm-2 1a1 1 0 110 2 1 1 0 010-2z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Media);
var _default = ForwardRef;
exports["default"] = _default;