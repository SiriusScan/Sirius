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

function ViadeoSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.75 18.589c0-.893-.161-1.786-.5-2.625-.464.286-.982.5-1.518.607.286.643.393 1.339.393 2.036 0 2.75-2.036 5-4.821 5-2.804 0-4.839-2.25-4.839-5 0-2.696 2.054-5.071 4.839-5.071.607 0 1.196.107 1.75.339a4.387 4.387 0 01.482-1.554 6.73 6.73 0 00-2.232-.375c-3.696 0-6.446 2.982-6.446 6.643s2.768 6.554 6.446 6.554 6.446-2.911 6.446-6.554zm-3.179-6.339c.036.429.036.857.036 1.268 0 3.304-.643 8.679-4.196 10.036.25.036.5.054.75.054h.179c2.643-1.679 3.911-4.25 3.911-7.339 0-1.375-.232-2.732-.679-4.018zm0 0c-.089-1.732-1.071-4.411-2.536-5.393 1 1.696 1.893 3.518 2.536 5.393zm5.983-1.875c0-1.089-.268-2.196-.911-3.107-.429.911-1.232 1.679-2.214 1.946-1.411.393-2.661 1.054-2.661 2.732 0 .482.161.964.429 1.375 1.696-.393 3.5-1.643 4.214-3.25-.107 1.429-2.768 3.161-3.804 3.732.518.518 1.196.929 1.964.929 1.304 0 2.232-1.161 2.679-2.268.214-.536.304-1.536.304-2.089zm5.875-2.946v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ViadeoSquare);
var _default = ForwardRef;
exports["default"] = _default;