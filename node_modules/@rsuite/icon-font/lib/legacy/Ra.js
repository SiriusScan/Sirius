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

function Ra(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M.339 15.607C.518 10.5 3.125 5.786 7.857 2.678c.018 0 .125-.036.071.054-.375.357-7.179 8.375-.911 14.607 3.214 3.196 5.804.161 5.804.161 2.482-3.232-.036-8.125-.036-8.125-.643-1.607-2.946-2.589-2.946-2.589l1.857-2.054c1.571.679 2.786 2.5 2.786 2.5.054-1.911-1.411-3.964-1.411-3.964L15.946 0l2.857 3.232c-1.321 1.857-1.411 4.036-1.411 4.036.893-1.482 2.804-2.536 2.804-2.536l1.839 2.054c-1.768.571-2.929 2.571-2.929 2.571-1.018 1.839-1.75 5.768.036 8.214 2.089 2.875 5.661-.179 5.661-.179 6.625-5.929-.679-14.518-.679-14.518-.393-.357.054-.179.054-.179 3.232 2.357 7.393 5.446 7.5 13.214.125 9.393-6.446 16.089-15.643 16.089-8.982 0-15.964-7.5-15.696-16.393z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Ra);
var _default = ForwardRef;
exports["default"] = _default;