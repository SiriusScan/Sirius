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

function Strikethrough(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M31.429 16c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571H.572a.564.564 0 01-.571-.571v-1.143c0-.321.25-.571.571-.571h30.857zM8.625 14.857a8.906 8.906 0 01-.911-1.429c-.571-1.161-.857-2.286-.857-3.357 0-2.179.804-4 2.393-5.518s3.929-2.268 7.018-2.268c.679 0 1.661.125 2.982.339.786.143 1.839.429 3.161.857.125.464.25 1.179.375 2.107.161 1.411.25 2.5.25 3.268 0 .25-.036.518-.089.804l-.214.054-1.5-.107-.25-.036c-.607-1.804-1.232-3.018-1.839-3.661-1.054-1.089-2.321-1.625-3.75-1.625-1.357 0-2.446.357-3.25 1.054s-1.196 1.571-1.196 2.607c0 .875.393 1.696 1.179 2.5s2.446 1.571 4.982 2.304c.857.25 1.875.643 3.089 1.179.643.304 1.214.607 1.696.929H8.626zm9.054 4.572h7.339c.089.5.125 1.054.125 1.643a9.983 9.983 0 01-.732 3.786c-.268.661-.679 1.268-1.268 1.857-.429.411-1.071.893-1.946 1.446-.893.536-1.786.946-2.732 1.179-.946.25-2.143.375-3.625.375-.982 0-2.161-.036-3.482-.411l-2.5-.714c-.696-.196-1.107-.357-1.286-.5a.538.538 0 01-.143-.393v-.232c0-.143.036-1.071-.036-2.786-.036-.893.036-1.518.036-1.875v-.786l1.821-.036c.661 1.518.964 2.429 1.161 2.75.429.696.911 1.25 1.429 1.679s1.143.768 1.875 1.018c.714.268 1.518.393 2.357.393.75 0 1.589-.161 2.482-.482.911-.304 1.643-.821 2.179-1.536.554-.714.839-1.482.839-2.304 0-1-.482-1.929-1.446-2.804-.393-.339-1.214-.768-2.446-1.268z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Strikethrough);
var _default = ForwardRef;
exports["default"] = _default;