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

function Codepen(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M3.857 20.875l10.768 7.179v-6.411l-5.964-3.982zM2.75 18.304L6.196 16 2.75 13.696v4.607zm14.625 9.75l10.768-7.179-4.804-3.214-5.964 3.982v6.411zM16 19.25L20.857 16 16 12.75 11.143 16zm-7.339-4.911l5.964-3.982V3.946L3.857 11.125zM25.804 16l3.446 2.304v-4.607zm-2.465-1.661l4.804-3.214-10.768-7.179v6.411zM32 11.125v9.75c0 .446-.232.893-.607 1.143l-14.625 9.75c-.232.143-.5.232-.768.232s-.536-.089-.768-.232L.607 22.018A1.397 1.397 0 010 20.875v-9.75c0-.446.232-.893.607-1.143L15.232.232C15.464.089 15.732 0 16 0s.536.089.768.232l14.625 9.75c.375.25.607.696.607 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Codepen);
var _default = ForwardRef;
exports["default"] = _default;