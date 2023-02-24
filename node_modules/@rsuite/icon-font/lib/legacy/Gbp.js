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

function Gbp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 18 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.214 20.304v6.554c0 .321-.25.571-.571.571H.572a.564.564 0 01-.571-.571v-2.679c0-.304.25-.571.571-.571h1.732v-6.839H.608a.564.564 0 01-.571-.571v-2.339c0-.321.25-.571.571-.571h1.696V9.306c0-4.071 3.286-7.018 7.821-7.018 3.571 0 5.875 2.143 5.982 2.232a.576.576 0 01.054.768l-1.839 2.268a.566.566 0 01-.804.089c-.018-.018-1.554-1.232-3.357-1.232-2.018 0-3.375 1.214-3.375 3.036v3.839h5.446c.321 0 .571.25.571.571v2.339c0 .321-.25.571-.571.571H6.786v6.768h7.393v-3.232c0-.321.25-.571.571-.571h2.893c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Gbp);
var _default = ForwardRef;
exports["default"] = _default;