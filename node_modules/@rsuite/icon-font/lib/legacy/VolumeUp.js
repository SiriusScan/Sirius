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

function VolumeUp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.714 6.286v19.429c0 .625-.518 1.143-1.143 1.143-.304 0-.589-.125-.804-.339l-5.946-5.946H1.142A1.151 1.151 0 01-.001 19.43v-6.857c0-.625.518-1.143 1.143-1.143h4.679l5.946-5.946c.214-.214.5-.339.804-.339.625 0 1.143.518 1.143 1.143zM20.571 16c0 1.786-1.089 3.518-2.768 4.196a1.005 1.005 0 01-.446.089 1.14 1.14 0 01-1.143-1.143c0-1.357 2.071-.982 2.071-3.143s-2.071-1.786-2.071-3.143a1.14 1.14 0 011.143-1.143 1 1 0 01.446.089c1.679.661 2.768 2.411 2.768 4.196zm4.572 0c0 3.625-2.179 7-5.536 8.411a1.316 1.316 0 01-.446.089A1.155 1.155 0 0118 23.357c0-.5.286-.839.696-1.054.482-.25.929-.464 1.357-.786 1.768-1.286 2.804-3.339 2.804-5.518s-1.036-4.232-2.804-5.518c-.429-.321-.875-.536-1.357-.786-.411-.214-.696-.554-.696-1.054 0-.625.518-1.143 1.143-1.143.161 0 .321.036.464.089 3.357 1.411 5.536 4.786 5.536 8.411zm4.571 0a13.724 13.724 0 01-8.304 12.607 1.334 1.334 0 01-.464.089 1.151 1.151 0 01-1.143-1.143c0-.518.268-.804.696-1.054.25-.143.536-.232.804-.375.5-.268 1-.571 1.464-.911 2.929-2.161 4.661-5.571 4.661-9.214s-1.732-7.054-4.661-9.214a12.512 12.512 0 00-1.464-.911c-.268-.143-.554-.232-.804-.375-.429-.25-.696-.536-.696-1.054 0-.625.518-1.143 1.143-1.143.161 0 .321.036.464.089a13.724 13.724 0 018.304 12.607z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(VolumeUp);
var _default = ForwardRef;
exports["default"] = _default;