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

function Tags(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8 8c0-1.268-1.018-2.286-2.286-2.286S3.428 6.732 3.428 8s1.018 2.286 2.286 2.286S8 9.268 8 8zm19.054 10.286c0 .607-.25 1.196-.661 1.607l-8.768 8.786c-.429.411-1.018.661-1.625.661s-1.196-.25-1.607-.661L1.625 15.893C.714 15 0 13.268 0 12V4.571a2.302 2.302 0 012.286-2.286h7.429c1.268 0 3 .714 3.911 1.625l12.768 12.75c.411.429.661 1.018.661 1.625zm6.857 0c0 .607-.25 1.196-.661 1.607l-8.768 8.786a2.375 2.375 0 01-1.625.661c-.929 0-1.393-.429-2-1.054l8.393-8.393c.411-.411.661-1 .661-1.607s-.25-1.196-.661-1.625L16.482 3.911c-.911-.911-2.643-1.625-3.911-1.625h4c1.268 0 3 .714 3.911 1.625l12.768 12.75c.411.429.661 1.018.661 1.625z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Tags);
var _default = ForwardRef;
exports["default"] = _default;