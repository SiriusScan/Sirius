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

function TencentWeibo(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.036 10.214a3.46 3.46 0 01-3.446 3.446 3.48 3.48 0 01-1.982-.625 21.787 21.787 0 00-2.054 2.607c-2.911 4.375-4.143 9.536-3.607 15.339a.951.951 0 01-.839 1.018h-.089a.944.944 0 01-.929-.839c-.696-7.821 1.786-13.357 3.982-16.625a22.04 22.04 0 012.357-2.946 3.282 3.282 0 01-.286-1.375 3.437 3.437 0 013.446-3.446 3.448 3.448 0 013.446 3.446zm6.803.197c0 5.732-4.661 10.393-10.411 10.393-.786 0-1.571-.089-2.339-.25a.95.95 0 01-.696-1.125.946.946 0 011.107-.696 7.798 7.798 0 001.929.232c4.714 0 8.554-3.839 8.554-8.554s-3.839-8.554-8.554-8.554-8.554 3.839-8.554 8.554a8.61 8.61 0 00.929 3.893.932.932 0 01-.393 1.25.923.923 0 01-1.25-.411 10.334 10.334 0 01-1.143-4.732C1.018 4.661 5.697 0 11.429 0c5.75 0 10.411 4.661 10.411 10.411z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TencentWeibo);
var _default = ForwardRef;
exports["default"] = _default;