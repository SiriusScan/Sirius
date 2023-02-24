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

function Firefox(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 31 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.125 32C9.232 32 3.75 27.964 1.232 22.196-1.589 15.785.661 5.517 5.678.982L5.482 6c.25-.321 2.161-.411 2.464 0C8.982 4.018 12.321 2.536 15 2.482c-1.018.857-3.375 3.982-3.179 5.571 1.304.411 3.304.429 4.357.5.321.179.268 1.268-.375 2.161 0 0-.839 1.161-3.107 1.571l.268 3.375-2.482-1.196c-.804 2.036 1.125 3.839 3.125 3.5 2.214-.375 3-1.821 4.554-1.732 1.536.089 2.143.946 1.946 1.75 0 0-.25.964-1.911.804-1.411 2.232-3.286 3.214-6.321 2.946 4.607 3.821 10.821.357 12.393-2.768 1.571-3.107.196-7.732-1.375-9.036 1.857.804 3.143 1.625 3.821 3.429.357-4-1.482-8.536-4.768-11.196C28.125 3.965 31.892 8.75 32 16.393S25.232 32 16.125 32z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Firefox);
var _default = ForwardRef;
exports["default"] = _default;