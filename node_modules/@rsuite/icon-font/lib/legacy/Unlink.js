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

function Unlink(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M7.839 22.696l-4.571 4.571c-.125.107-.268.161-.411.161s-.286-.054-.411-.161a.605.605 0 010-.821l4.571-4.571a.605.605 0 01.821 0 .605.605 0 010 .821zm3.018.733v5.714c0 .321-.25.571-.571.571s-.571-.25-.571-.571v-5.714c0-.321.25-.571.571-.571s.571.25.571.571zm-4-4c0 .321-.25.571-.571.571H.572c-.321 0-.571-.25-.571-.571s.25-.571.571-.571h5.714c.321 0 .571.25.571.571zm22.572 2.285a5.036 5.036 0 01-1.518 3.625l-2.625 2.607c-.964.964-2.25 1.482-3.625 1.482s-2.679-.536-3.643-1.518l-5.964-5.982a5.037 5.037 0 01-.75-1l4.268-.321 4.875 4.893c.643.643 1.786.661 2.429.018l2.625-2.607a1.702 1.702 0 000-2.41l-4.893-4.911.321-4.268c.357.214.696.446 1 .75l6 6a5.165 5.165 0 011.5 3.643zM18.411 8.786l-4.268.321-4.875-4.893c-.321-.321-.75-.5-1.214-.5s-.893.179-1.214.482L4.215 6.803a1.702 1.702 0 000 2.41l4.893 4.893-.321 4.286a5.037 5.037 0 01-1-.75l-6-6c-.964-.982-1.5-2.268-1.5-3.643s.536-2.661 1.518-3.625L4.43 1.767C5.394.803 6.68.285 8.055.285s2.679.536 3.643 1.518l5.964 5.982c.304.304.536.643.75 1zm11.303 1.5c0 .321-.25.571-.571.571h-5.714c-.321 0-.571-.25-.571-.571s.25-.571.571-.571h5.714c.321 0 .571.25.571.571zM20 .571v5.714c0 .321-.25.571-.571.571s-.571-.25-.571-.571V.571c0-.321.25-.571.571-.571S20 .25 20 .571zm7.268 2.697l-4.571 4.571c-.125.107-.268.161-.411.161s-.286-.054-.411-.161a.605.605 0 010-.821l4.571-4.571a.605.605 0 01.821 0 .605.605 0 010 .821z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Unlink);
var _default = ForwardRef;
exports["default"] = _default;