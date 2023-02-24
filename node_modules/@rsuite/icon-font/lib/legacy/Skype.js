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

function Skype(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.946 18.982c0-3.107-3.018-4.179-5.554-4.75l-1.857-.429c-1.357-.321-2.375-.554-2.375-1.589 0-.946 1-1.375 2.571-1.375 2.804 0 2.857 2.054 4.589 2.054 1.161 0 1.857-.911 1.857-1.946 0-2.054-3.411-3.393-6.786-3.393-3.089 0-6.679 1.339-6.679 4.964 0 3 2 4.071 4.607 4.696l2.607.643c1.589.393 2.571.571 2.571 1.714 0 .911-1.018 1.607-2.589 1.607-3.304 0-3.482-2.75-5.393-2.75-1.25 0-1.804.893-1.804 1.875 0 2.196 3.357 3.982 7.375 3.982 3.357 0 6.857-1.679 6.857-5.304zm6.483 3.875a6.858 6.858 0 01-6.857 6.857 6.832 6.832 0 01-4.179-1.429c-.857.179-1.768.286-2.679.286-6.946 0-12.571-5.625-12.571-12.571 0-.911.107-1.821.286-2.679A6.83 6.83 0 010 9.142a6.858 6.858 0 016.857-6.857c1.571 0 3.018.536 4.179 1.429a13.203 13.203 0 012.679-.286c6.946 0 12.571 5.625 12.571 12.571 0 .911-.107 1.821-.286 2.679a6.83 6.83 0 011.429 4.179z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Skype);
var _default = ForwardRef;
exports["default"] = _default;