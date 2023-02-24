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

function Eercast(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 31 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M23.946 14c.625-.964-.107-3.411-2.286-4.857-2.161-1.446-4.929-1.339-5.571-.375-.625.946.714.339 3.161 1.25 4.036 1.5 4.071 4.946 4.696 3.982zm6.483 10.25C25.375 36.679 2.608 33.536 3.09 17.411c.054-2.054.625-3.429 1.214-5.393C.536 27.447 21.554 36.429 30.179 24.25c.321-.446.411-.411.25 0zm-4.268-8.018c0 5.054-4.071 9.161-9.089 9.161s-9.089-4.107-9.089-9.161 4.071-9.161 9.089-9.161 9.089 4.107 9.089 9.161zm5.125-5.143C24.929-3.34-1.321 1.982 1.59 21.607-4.446 1.946 20.429-7.072 29.626 6.928c.75 1.143 1.607 3.143 1.661 4.161zm-1.107 6.107c.304-6.036-3.875-10.161-9.518-11.714-.089 0-.482-.161.25-.232 13.786.464 14.286 22.5-.732 22.75 4.893-1.357 9.696-4.75 10-10.804z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Eercast);
var _default = ForwardRef;
exports["default"] = _default;