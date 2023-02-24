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

function HandGrabO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.714 6.857a2.279 2.279 0 00-2.286 2.286v2.286h-.571V9.768c0-1.125-.857-2.054-2-2.054-1.107 0-2 .893-2 2v7.661l-.571-.536v-3.071c0-1.125-.857-2.054-2-2.054-1.107 0-2 .893-2 2v4c0 .554.232 1.071.625 1.464l5.536 5.286c.518.518.696 1.107.696 1.821 0 .625.518 1.143 1.143 1.143h11.429c.625 0 1.143-.518 1.143-1.143v-.446c0-.464.054-.929.179-1.375l1.929-7.786c.125-.446.179-.911.179-1.375V10.91c0-1.125-.857-2.054-2-2.054-1.107 0-2 .893-2 2v.571h-.571V9.195c0-.946-.643-1.821-1.589-2.018a2.91 2.91 0 00-.411-.036c-1.107 0-2 .893-2 2v2.286h-.571V9.248c0-1.196-.857-2.25-2.054-2.375-.089-.018-.161-.018-.232-.018zm0-2.286c.964 0 1.893.304 2.661.893a4.327 4.327 0 012.196-.607c1.411 0 2.714.679 3.518 1.839a4.16 4.16 0 011.054-.125c2.393 0 4.286 1.964 4.286 4.339v4.393c0 .643-.089 1.304-.232 1.929l-1.946 7.786c-.107.429-.107.839-.107 1.268a3.43 3.43 0 01-3.429 3.429H10.286c-2.036 0-3.429-1.625-3.429-3.589l-5.5-5.286C.518 20.036 0 18.894 0 17.715v-4a4.299 4.299 0 014.286-4.286c.107 0 .196 0 .286.018a4.297 4.297 0 014.286-4.018c.607 0 1.196.125 1.75.375a4.462 4.462 0 013.107-1.232z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandGrabO);
var _default = ForwardRef;
exports["default"] = _default;