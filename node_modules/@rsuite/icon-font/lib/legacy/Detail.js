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

function Detail(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.75 13.125l-.619.256.256-.256h.362zm-.362 0l3.244-3.244.619.619-3.5 3.5H2.626a1.75 1.75 0 01-1.75-1.75V1.75C.876.784 1.66 0 2.626 0h7.875c.966 0 1.75.784 1.75 1.75v6.125h-.875V1.75a.875.875 0 00-.875-.875H2.626a.875.875 0 00-.875.875v10.5c0 .483.392.875.875.875h5.763zm.362 0l-.619.256.256-.256h.362zm-.362 0l3.244-3.244.619.619-3.5 3.5H2.626a1.75 1.75 0 01-1.75-1.75V1.75C.876.784 1.66 0 2.626 0h7.875c.966 0 1.75.784 1.75 1.75v6.125h-.875V1.75a.875.875 0 00-.875-.875H2.626a.875.875 0 00-.875.875v10.5c0 .483.392.875.875.875h5.763z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.313 14a.438.438 0 00.438-.438v-3.5a.438.438 0 10-.876 0v3.5c0 .242.196.438.438.438zM3.938 9.625h2.625a.438.438 0 100-.876H3.938a.438.438 0 100 .876zM3.938 11.375h2.625a.438.438 0 100-.876H3.938a.438.438 0 100 .876zM4.375 6.125v-3.5a.438.438 0 10-.876 0V7h5.688a.438.438 0 100-.876H4.374z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.875 4.631L6.434 3.19a.438.438 0 00-.619 0l-1.75 1.75a.438.438 0 10.619.619l1.441-1.441 1.441 1.441a.438.438 0 00.619 0l1.75-1.75a.438.438 0 10-.619-.619L7.875 4.631zM8.313 10.5h3.938v-.875H8.313a.438.438 0 100 .876z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Detail);
var _default = ForwardRef;
exports["default"] = _default;