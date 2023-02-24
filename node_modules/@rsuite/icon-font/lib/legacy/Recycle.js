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

function Recycle(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14.929 20.875l-.268 6.571-.036.393-7.5-.518c-.929-.071-1.696-.946-2.036-1.732-.714-1.661.214-3.625.75-5.214 0 0 1.375.214 9.089.5zM8.018 10.411l3.214 6.768-2.625-1.643c-4.018 4.589-4.393 8-4.393 8L.821 17.161C.125 16.125.75 15 .75 15s.625-1.125 2.036-3.357l-2.5-1.536zM30 19.643l-3.357 6.411c-.464 1.161-1.75 1.268-1.75 1.268s-1.268.125-3.911.214l.143 2.929-4.107-6.554 3.768-6.464.125 3.089c6.054.732 9.089-.893 9.089-.893zm-14.018-16.5s-.839 1.107-4.732 7.768L5.589 7.572l-.339-.214 4.018-6.357c.5-.786 1.625-1.071 2.5-.982 1.786.161 3.071 1.893 4.214 3.125zm11.697 5.482l3.786 6.482c.482.804.196 1.929-.268 2.679-.964 1.5-3.107 1.857-4.714 2.304 0 0-.607-1.268-4.732-7.786l5.589-3.482zm-2.554-4.036l2.536-1.482-3.929 6.661-7.482-.357 2.696-1.536C16.803 2.179 13.964.214 13.964.214l7.232.018c1.25-.107 1.929.964 1.929.964s.696 1.089 2 3.393z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Recycle);
var _default = ForwardRef;
exports["default"] = _default;