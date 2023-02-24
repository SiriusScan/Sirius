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

function Question2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 2.13c7.648 0 13.87 6.222 13.87 13.87S23.648 29.87 16 29.87 2.13 23.648 2.13 16 8.352 2.13 16 2.13zM16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.046 23.182h3.989v3.941h-3.989v-3.941zM22.727 12.414a6.69 6.69 0 01-.624 1.442c-.265.455-.585.882-.96 1.289s-.786.795-1.234 1.168c-.503.416-.905.784-1.209 1.104s-.512.599-.617.834c-.215.457-.32 1.465-.32 3.029h-3.602c0-2.135.208-3.637.624-4.503.407-.834 1.163-1.712 2.274-2.642.48-.393.855-.745 1.12-1.049.267-.306.471-.576.606-.816.139-.24.226-.464.258-.672s.046-.425.046-.647c0-.418-.071-.802-.215-1.152a2.678 2.678 0 00-.615-.917 2.848 2.848 0 00-.944-.599 3.177 3.177 0 00-1.218-.217c-1.751 0-2.818 1.223-3.202 3.669H9.05c.096-1.047.334-1.998.713-2.846s.878-1.57 1.49-2.162 1.328-1.049 2.146-1.369a7.24 7.24 0 012.665-.48c1.024 0 1.959.149 2.802.441.843.295 1.566.699 2.167 1.225.606.521 1.074 1.145 1.41 1.872s.503 1.513.503 2.373a5.58 5.58 0 01-.219 1.625z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Question2);
var _default = ForwardRef;
exports["default"] = _default;