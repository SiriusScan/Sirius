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

function Vine(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.732 14.768v3.536c-1.25.286-2.5.411-3.536.411-2.5 5.25-6.982 9.75-8.482 10.589-.946.536-1.839.571-2.893-.054C9.982 28.143 3.017 22.429.696 4.464H5.75c1.268 10.786 4.375 16.321 7.786 20.464 1.893-1.893 3.714-4.411 5.125-7.25-3.375-1.714-5.429-5.482-5.429-9.875 0-4.446 2.554-7.804 6.929-7.804 4.25 0 6.571 2.643 6.571 7.196 0 1.696-.357 3.625-1.036 5.107 0 0-3.143.625-4.304-1.393.232-.768.554-2.089.554-3.286 0-2.125-.768-3.161-1.929-3.161-1.232 0-2.089 1.161-2.089 3.393 0 4.554 2.893 7.161 6.643 7.161.661 0 1.411-.071 2.161-.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Vine);
var _default = ForwardRef;
exports["default"] = _default;