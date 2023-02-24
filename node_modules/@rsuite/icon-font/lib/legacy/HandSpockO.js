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

function HandSpockO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.196 32a3.991 3.991 0 01-3.875-3.036l-1.804-7.161a8.757 8.757 0 01-.232-1.929c0-.411 0-.804-.089-1.196L.125 10.16A3.986 3.986 0 010 9.142c0-2.214 1.679-4.036 3.875-4.268a4.237 4.237 0 014.196-3.446 4.279 4.279 0 014.161 3.286l1.482 6.214 1.839-7.643a4.278 4.278 0 014.161-3.286c2.125 0 3.875 1.536 4.214 3.607 2.196.25 3.786 2.107 3.786 4.304 0 .339-.054.696-.125 1.054l-2.196 9.143C26.822 17.036 27.857 16 29.732 16c2.482 0 4.554 2.018 4.554 4.518 0 1.5-.732 2.893-1.911 3.786l-9.054 6.786a4.57 4.57 0 01-2.732.911H8.196zM19.714 2.286c-.911 0-1.714.643-1.929 1.536l-2.929 12.179h-2.268L9.999 5.251A2.002 2.002 0 008.07 3.715c-1.143 0-2 .911-2 2.018 0 .179.018.339.054.5l2.357 9.768h-.464L6.249 8.715c-.214-.875-1.018-1.571-1.946-1.571a2.012 2.012 0 00-2.018 2c0 .161.018.321.054.464l2.071 8.536c.25 1.036.071 2.071.339 3.107l1.786 7.161a1.716 1.716 0 001.661 1.304h12.393c.482 0 .964-.161 1.357-.464L31 22.484c.607-.464 1-1.196 1-1.964 0-1.25-1.036-2.232-2.268-2.232-.5 0-.982.161-1.375.464l-5.482 4.107v-4.054c0-.143 2.304-9.607 2.482-10.375.036-.161.071-.339.071-.518 0-1.107-.839-2.054-1.982-2.054-.929 0-1.732.643-1.946 1.536l-2.071 8.607h-.464l2.679-11.143c.036-.161.054-.339.054-.5 0-1.125-.821-2.071-1.982-2.071z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandSpockO);
var _default = ForwardRef;
exports["default"] = _default;