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

function FileDownload(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.388.875l3.244 3.244.619-.619-3.5-3.5H2.626a1.75 1.75 0 00-1.75 1.75v10.5c0 .966.784 1.75 1.75 1.75h7.875a1.75 1.75 0 001.75-1.75V6.125h-.875v6.125a.875.875 0 01-.875.875H2.626a.875.875 0 01-.875-.875V1.75c0-.483.392-.875.875-.875h5.763z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.313 0c.242 0 .438.196.438.438v3.5a.438.438 0 11-.876 0v-3.5c0-.242.196-.438.438-.438zM6.125 5.688a.438.438 0 11.876 0v4.375a.438.438 0 11-.876 0V5.688z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.872 9.753a.438.438 0 11-.619.619L4.065 8.184a.438.438 0 11.619-.619l2.188 2.188z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.253 9.753l2.188-2.188a.438.438 0 11.619.619l-2.188 2.188a.438.438 0 11-.619-.619zM8.313 3.5h3.938v.875H8.313a.438.438 0 110-.876z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FileDownload);
var _default = ForwardRef;
exports["default"] = _default;