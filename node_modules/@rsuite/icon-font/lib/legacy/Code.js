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

function Code(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.018 24.982l-.893.893a.571.571 0 01-.821 0L.983 17.554a.571.571 0 010-.821l8.321-8.321a.571.571 0 01.821 0l.893.893a.571.571 0 010 .821L4 17.144l7.018 7.018a.571.571 0 010 .821zM21.571 5.929L14.91 28.983c-.089.304-.411.482-.696.393l-1.107-.304a.579.579 0 01-.393-.714l6.661-23.054c.089-.304.411-.482.696-.393l1.107.304a.579.579 0 01.393.714zm11.733 11.625l-8.321 8.321a.571.571 0 01-.821 0l-.893-.893a.571.571 0 010-.821l7.018-7.018-7.018-7.018a.571.571 0 010-.821l.893-.893a.571.571 0 01.821 0l8.321 8.321a.571.571 0 010 .821z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Code);
var _default = ForwardRef;
exports["default"] = _default;