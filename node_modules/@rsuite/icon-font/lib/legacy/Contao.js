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

function Contao(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M2.464 2.286h3.518a14.218 14.218 0 00-2.25 2.661c-2.768 4.268-1.643 8.946-.571 13.982.875 4.089 1.607 7.982 4.161 10.786H2.465a2.073 2.073 0 01-2.071-2.071V4.358c0-1.143.929-2.071 2.071-2.071zm21.572 0h5.5c1.143 0 2.071.929 2.071 2.071v23.286a2.073 2.073 0 01-2.071 2.071h-3.179c2.357-2.339 3.696-5.732 3.5-10.089l-8.375 1.804c-.107 1.982-.786 3.893-3.5 4.464-1.518.321-2.768-.036-3.554-.714-.964-.821-1.732-1.893-3.018-8-1.304-6.125-1.036-7.411-.5-8.554.446-.929 1.446-1.786 2.946-2.107 2.732-.571 4.125.911 5.036 2.679l8.357-1.786c-.821-2.107-1.911-3.821-3.214-5.125z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Contao);
var _default = ForwardRef;
exports["default"] = _default;