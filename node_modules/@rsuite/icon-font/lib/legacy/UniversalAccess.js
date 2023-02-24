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

function UniversalAccess(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M24.536 11.732a1.137 1.137 0 00-1.375-.839C20.607 11.5 18.286 12 16 12s-4.607-.5-7.161-1.107a1.137 1.137 0 00-1.375.839 1.137 1.137 0 00.839 1.375c1.893.446 3.661.839 5.411 1.036-.071 6.036-.732 7.714-1.482 9.643l-.161.375c-.232.589.071 1.25.661 1.482.125.054.268.071.411.071.464 0 .893-.268 1.071-.732l.143-.357c.5-1.286.964-2.482 1.268-4.625h.75c.304 2.143.768 3.339 1.268 4.625l.143.357c.179.464.607.732 1.071.732.143 0 .286-.018.411-.071.589-.232.893-.893.661-1.482l-.161-.375c-.75-1.929-1.411-3.607-1.482-9.643 1.75-.196 3.518-.589 5.411-1.036.607-.143.982-.75.839-1.375zm-6.25-2.589c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zM28.571 16c0 6.946-5.625 12.571-12.571 12.571S3.429 22.946 3.429 16 9.054 3.429 16 3.429 28.571 9.054 28.571 16zM16 2.286C8.446 2.286 2.286 8.447 2.286 16S8.447 29.714 16 29.714 29.714 23.553 29.714 16 23.553 2.286 16 2.286zM32 16c0 8.839-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0s16 7.161 16 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UniversalAccess);
var _default = ForwardRef;
exports["default"] = _default;