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

function Random(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.893 8.589c-1 1.536-1.732 3.196-2.446 4.875-1.036-2.161-2.179-4.321-4.875-4.321h-4a.564.564 0 01-.571-.571V5.143c0-.321.25-.571.571-.571h4c3.179 0 5.518 1.482 7.321 4.018zM32 22.857a.597.597 0 01-.161.411l-5.714 5.714a.597.597 0 01-.411.161.587.587 0 01-.571-.571v-3.429c-5.304 0-8.571.625-11.875-4.018.982-1.536 1.714-3.196 2.429-4.875 1.036 2.161 2.179 4.321 4.875 4.321h4.571v-3.429c0-.321.25-.571.571-.571.161 0 .304.071.429.179l5.696 5.696a.597.597 0 01.161.411zm0-16a.597.597 0 01-.161.411l-5.714 5.714a.597.597 0 01-.411.161.575.575 0 01-.571-.571V9.143h-4.571c-2.375 0-3.5 1.625-4.5 3.554-.518 1-.964 2.036-1.393 3.054-1.982 4.607-4.304 9.393-10.107 9.393h-4a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h4c2.375 0 3.5-1.625 4.5-3.554.518-1 .964-2.036 1.393-3.054 1.982-4.607 4.304-9.393 10.107-9.393h4.571V1.143c0-.321.25-.571.571-.571.161 0 .304.071.429.179l5.696 5.696a.597.597 0 01.161.411z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Random);
var _default = ForwardRef;
exports["default"] = _default;