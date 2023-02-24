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

function Whatsapp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.589 17.393c.304 0 3.214 1.518 3.339 1.732a.733.733 0 01.036.268c0 .446-.143.946-.304 1.357-.411 1-2.071 1.643-3.089 1.643-.857 0-2.625-.75-3.393-1.107-2.554-1.161-4.143-3.143-5.679-5.411-.679-1-1.286-2.232-1.268-3.464v-.143c.036-1.179.464-2.018 1.321-2.821.268-.25.554-.393.929-.393.214 0 .429.054.661.054.482 0 .571.143.75.607.125.304 1.036 2.732 1.036 2.911 0 .679-1.232 1.446-1.232 1.857 0 .089.036.179.089.268.393.839 1.143 1.804 1.821 2.446.821.786 1.696 1.304 2.696 1.804.125.071.25.125.393.125.536 0 1.429-1.732 1.893-1.732zm-3.625 9.464c6.179 0 11.214-5.036 11.214-11.214S20.142 4.429 13.964 4.429 2.75 9.465 2.75 15.643c0 2.357.75 4.661 2.143 6.571l-1.411 4.161L7.803 25a11.29 11.29 0 006.161 1.857zm0-24.678c7.429 0 13.464 6.036 13.464 13.464s-6.036 13.464-13.464 13.464c-2.268 0-4.518-.571-6.518-1.679L0 29.821l2.429-7.232A13.397 13.397 0 01.5 15.643C.5 8.214 6.536 2.179 13.964 2.179z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Whatsapp);
var _default = ForwardRef;
exports["default"] = _default;