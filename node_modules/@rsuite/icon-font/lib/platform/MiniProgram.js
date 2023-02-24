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

function MiniProgram(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8 0a8 8 0 110 16A8 8 0 018 0zm5.645 4.472c-1.219-1.951-4.013-2.124-5.741-.032-.704.852-.912 1.756-.91 3.09 0 .138.002.247.006.488.024 1.315-.056 1.796-.446 2.268-.861 1.043-2.01.972-2.503.182-.252-.403-.361-1.123-.219-1.663C3.974 8.268 4.304 8 5 8a1 1 0 000-2c-1.625 0-2.733.898-3.101 2.293-.284 1.075-.088 2.363.456 3.234 1.219 1.951 4.013 2.124 5.741.032.797-.965.936-1.801.904-3.578l-.005-.308-.001-.147c-.001-.911.111-1.401.452-1.813.861-1.043 2.01-.972 2.503-.182.252.403.361 1.123.219 1.663-.142.537-.472.805-1.168.805a1 1 0 000 2c1.625 0 2.733-.898 3.101-2.293.284-1.075.088-2.363-.456-3.234z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(MiniProgram);
var _default = ForwardRef;
exports["default"] = _default;