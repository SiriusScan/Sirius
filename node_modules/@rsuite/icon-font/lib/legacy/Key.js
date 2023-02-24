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

function Key(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14.857 9.143a3.43 3.43 0 00-6.858 0c0 .518.125 1.018.339 1.482a3.533 3.533 0 00-1.482-.339 3.43 3.43 0 000 6.858 3.43 3.43 0 003.429-3.429c0-.518-.125-1.018-.339-1.482.464.214.964.339 1.482.339a3.43 3.43 0 003.429-3.429zm15.197 12.571c0 .411-1.643 2.054-2.054 2.054-.464 0-1.911-1.679-2.286-2.054L24 23.428l3.929 3.929c.321.321.5.768.5 1.214 0 1-1.143 2.143-2.143 2.143-.446 0-.893-.179-1.214-.5L13.09 18.232c-1.875 1.393-4.161 2.339-6.518 2.339C2.679 20.571.001 17.875.001 14c0-5.857 5.857-11.714 11.714-11.714 3.875 0 6.571 2.679 6.571 6.571 0 2.357-.946 4.643-2.339 6.518l6.339 6.339L24 20c-.375-.375-2.054-1.821-2.054-2.286 0-.411 1.643-2.054 2.054-2.054.143 0 .304.071.411.179.661.661 5.643 5.357 5.643 5.875z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Key);
var _default = ForwardRef;
exports["default"] = _default;