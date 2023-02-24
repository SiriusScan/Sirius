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

function TextWidth(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M1.446 2.304l.964.482c.125.054 3.393.089 3.768.089 1.571 0 3.143-.071 4.714-.071 4.732 0 9.518-.107 14.25.054.393.018.768-.232 1-.554l.75-.018c.161 0 .339.018.5.018.036 2 .036 4 .036 6 0 .643.018 1.321-.089 1.946a5.77 5.77 0 01-1.214.321c-.411-.714-.696-1.5-.964-2.286-.125-.357-.571-2.768-.589-2.804a1.033 1.033 0 00-.482-.339c-.143-.054-1-.036-1.179-.036-2.196 0-4.732-.125-6.893.125-.089.786-.161 1.625-.143 2.429l.018 2.714v-.929c.018 2.911.054 5.804.054 8.696 0 1.375-.214 2.821.179 4.143 1.357.696 2.964.804 4.357 1.429.036.286.089.589.089.893 0 .161-.018.339-.054.518l-.607.018c-2.536.071-5.036-.321-7.589-.321-1.804 0-3.607.321-5.411.321-.018-.304-.054-.625-.054-.929v-.161c.679-1.089 3.125-1.107 4.25-1.768.446-1 .321-9.446.321-11.018 0-.25-.089-.518-.089-.786 0-.732.125-4.929-.143-5.232-.25-.268-2.589-.214-2.893-.214-.75 0-4.946.393-5.375.679-.839.554-.857 4.143-1.929 4.232-.321-.196-.768-.482-1-.786V2.32zm21.947 22.892c.625 0 3 2.125 3.482 2.5.268.214.464.518.464.875s-.196.661-.464.875c-.482.375-2.857 2.5-3.482 2.5-.821 0-.536-1.911-.536-2.232H4.571c0 .321.286 2.232-.536 2.232-.625 0-3-2.125-3.482-2.5-.268-.214-.464-.518-.464-.875s.196-.661.464-.875c.482-.375 2.857-2.5 3.482-2.5.821 0 .536 1.911.536 2.232h18.286c0-.321-.286-2.232.536-2.232z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TextWidth);
var _default = ForwardRef;
exports["default"] = _default;