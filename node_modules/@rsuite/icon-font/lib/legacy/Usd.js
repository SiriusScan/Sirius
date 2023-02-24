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

function Usd(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 18 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.464 21.161c0 3.643-2.607 6.518-6.393 7.143v3.125c0 .321-.25.571-.571.571H8.089a.575.575 0 01-.571-.571v-3.125c-4.179-.589-6.464-3.089-6.554-3.196a.592.592 0 01-.036-.732l1.839-2.411c.089-.125.25-.196.411-.214s.321.036.429.161c.036.018 2.536 2.411 5.696 2.411 1.75 0 3.643-.929 3.643-2.946 0-1.714-2.107-2.554-4.518-3.518-3.214-1.268-7.214-2.875-7.214-7.357 0-3.286 2.571-6 6.304-6.714V.574c0-.321.268-.571.571-.571H10.5c.321 0 .571.25.571.571v3.143c3.625.411 5.554 2.375 5.625 2.446a.571.571 0 01.089.679l-1.446 2.607a.527.527 0 01-.411.286.588.588 0 01-.482-.125c-.018-.018-2.179-1.929-4.857-1.929-2.268 0-3.839 1.125-3.839 2.75 0 1.893 2.179 2.732 4.714 3.714 3.286 1.268 7 2.714 7 7.018z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Usd);
var _default = ForwardRef;
exports["default"] = _default;