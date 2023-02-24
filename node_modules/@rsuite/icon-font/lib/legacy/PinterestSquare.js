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

function PinterestSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.286 2.286a5.145 5.145 0 015.143 5.143v17.143a5.145 5.145 0 01-5.143 5.143H9.34c.589-.839 1.554-2.286 1.929-3.75 0 0 .161-.607.946-3.732.482.911 1.857 1.696 3.321 1.696 4.357 0 7.321-3.982 7.321-9.304 0-4.018-3.411-7.768-8.589-7.768-6.446 0-9.696 4.625-9.696 8.482 0 2.321.893 4.393 2.786 5.179.304.125.589 0 .679-.339.054-.232.196-.839.268-1.089.089-.339.054-.464-.196-.75-.536-.661-.893-1.482-.893-2.679 0-3.429 2.571-6.482 6.679-6.482 3.643 0 5.643 2.214 5.643 5.196 0 3.911-1.732 7.214-4.304 7.214-1.411 0-2.482-1.179-2.143-2.625.411-1.714 1.196-3.571 1.196-4.804 0-1.107-.589-2.036-1.821-2.036-1.446 0-2.607 1.5-2.607 3.5 0 0 0 1.286.429 2.161-1.482 6.286-1.75 7.393-1.75 7.393-.393 1.643-.232 3.554-.125 4.536H5.145a5.145 5.145 0 01-5.143-5.143V7.428a5.145 5.145 0 015.143-5.143h17.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PinterestSquare);
var _default = ForwardRef;
exports["default"] = _default;