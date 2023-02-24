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

function ShareSquareO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 17.661v4.625A5.145 5.145 0 0120 27.429H5.143A5.145 5.145 0 010 22.286V7.429a5.145 5.145 0 015.143-5.143h4.554c.304 0 .571.25.571.571a.575.575 0 01-.464.571c-.893.304-1.696.661-2.375 1.071a.744.744 0 01-.286.071h-2a2.866 2.866 0 00-2.857 2.857v14.857a2.866 2.866 0 002.857 2.857H20a2.866 2.866 0 002.857-2.857v-3.821c0-.214.125-.411.321-.518.357-.161.679-.393.964-.661.161-.161.411-.232.625-.143s.375.286.375.518zm4.232-8.857l-6.857 6.857c-.214.232-.5.339-.804.339-.143 0-.304-.036-.446-.089a1.156 1.156 0 01-.696-1.054v-3.429h-2.857c-3.929 0-6.429.75-7.821 2.339-1.446 1.661-1.875 4.339-1.321 8.446.036.25-.125.5-.357.607a.59.59 0 01-.678-.196c-.125-.179-2.964-4.196-2.964-7.768 0-4.786 1.5-10.286 13.143-10.286h2.857V1.141c0-.464.286-.875.696-1.054.143-.054.304-.089.446-.089.304 0 .589.125.804.339l6.857 6.857a1.132 1.132 0 010 1.607z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ShareSquareO);
var _default = ForwardRef;
exports["default"] = _default;