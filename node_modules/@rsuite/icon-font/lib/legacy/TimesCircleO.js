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

function TimesCircleO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M19.589 19.268l-2.607 2.607a.571.571 0 01-.821 0l-2.446-2.446-2.446 2.446a.571.571 0 01-.821 0l-2.607-2.607a.571.571 0 010-.821l2.446-2.446-2.446-2.446a.571.571 0 010-.821l2.607-2.607a.571.571 0 01.821 0l2.446 2.446 2.446-2.446a.571.571 0 01.821 0l2.607 2.607a.571.571 0 010 .821l-2.446 2.446 2.446 2.446a.571.571 0 010 .821zM23.429 16c0-5.357-4.357-9.714-9.714-9.714S4.001 10.643 4.001 16s4.357 9.714 9.714 9.714 9.714-4.357 9.714-9.714zm4 0c0 7.571-6.143 13.714-13.714 13.714S.001 23.571.001 16 6.144 2.286 13.715 2.286 27.429 8.429 27.429 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TimesCircleO);
var _default = ForwardRef;
exports["default"] = _default;