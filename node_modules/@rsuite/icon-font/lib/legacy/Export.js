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

function Export(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.25 12.25v.875H3.5C1.531 12.883 0 11.214 0 9.187a3.938 3.938 0 012.631-3.715 4.375 4.375 0 018.661-1.077A3.063 3.063 0 0114 7.437h-.875a2.187 2.187 0 00-1.934-2.173l-.634-.073-.124-.626a3.501 3.501 0 00-6.929.863l.033.652-.616.217a3.064 3.064 0 00-2.046 2.89 3.105 3.105 0 002.682 3.063H5.25z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.688 10.5a.438.438 0 110-.876h6.125a.438.438 0 110 .876H5.688z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12.378 9.753a.438.438 0 11.619.619l-2.625 2.625a.438.438 0 11-.619-.619l2.625-2.625z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12.378 10.372L9.753 7.747a.438.438 0 11.619-.619l2.625 2.625a.438.438 0 11-.619.619z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Export);
var _default = ForwardRef;
exports["default"] = _default;