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

function PinterestP(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M0 10.661C0 4.072 6.036 0 12.143 0c5.607 0 10.714 3.857 10.714 9.768 0 5.554-2.839 11.714-9.161 11.714-1.5 0-3.393-.75-4.125-2.143-1.357 5.375-1.25 6.179-4.25 10.286l-.25.089-.161-.179c-.107-1.125-.268-2.232-.268-3.357 0-3.643 1.679-8.911 2.5-12.446-.446-.911-.571-2.018-.571-3.018 0-1.804 1.25-4.089 3.286-4.089 1.5 0 2.304 1.143 2.304 2.554 0 2.321-1.571 4.5-1.571 6.75 0 1.536 1.268 2.607 2.75 2.607 4.107 0 5.375-5.929 5.375-9.089 0-4.232-3-6.536-7.054-6.536-4.714 0-8.357 3.393-8.357 8.179 0 2.304 1.411 3.482 1.411 4.036 0 .464-.339 2.107-.929 2.107-.089 0-.214-.036-.304-.054C.928 16.411 0 13 0 10.661z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PinterestP);
var _default = ForwardRef;
exports["default"] = _default;