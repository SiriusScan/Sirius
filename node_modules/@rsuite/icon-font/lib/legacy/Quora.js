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

function Quora(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.411 14.054c0-7.446-2.321-11.268-7.768-11.268-5.357 0-7.679 3.821-7.679 11.268 0 7.411 2.321 11.196 7.679 11.196.857 0 1.625-.089 2.339-.304-1.107-2.179-2.411-4.375-4.946-4.375-.482 0-.964.071-1.411.286l-.875-1.732c1.054-.911 2.75-1.625 4.929-1.625 3.411 0 5.143 1.643 6.536 3.732.804-1.786 1.196-4.196 1.196-7.179zm6.964 11.285h2.089c.125 1.286-.518 6.661-6.357 6.661-3.536 0-5.393-2.054-6.804-4.446a13.839 13.839 0 01-3.661.482C7.499 28.036.517 22.34.517 14.054.517 5.697 7.517 0 14.642 0c7.268 0 14.179 5.661 14.179 14.054 0 4.679-2.179 8.482-5.339 10.929 1.018 1.536 2.071 2.554 3.536 2.554 1.607 0 2.25-1.232 2.357-2.196z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Quora);
var _default = ForwardRef;
exports["default"] = _default;