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

function Twitter(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M28.929 7.286a12.395 12.395 0 01-2.893 2.982c.018.25.018.5.018.75 0 7.625-5.804 16.411-16.411 16.411-3.268 0-6.304-.946-8.857-2.589.464.054.911.071 1.393.071 2.696 0 5.179-.911 7.161-2.464a5.778 5.778 0 01-5.393-4c.357.054.714.089 1.089.089.518 0 1.036-.071 1.518-.196a5.769 5.769 0 01-4.625-5.661v-.071a5.809 5.809 0 002.607.732 5.764 5.764 0 01-2.571-4.804c0-1.071.286-2.054.786-2.911a16.394 16.394 0 0011.893 6.036 6.533 6.533 0 01-.143-1.321 5.765 5.765 0 015.768-5.768c1.661 0 3.161.696 4.214 1.821A11.345 11.345 0 0028.144 5a5.756 5.756 0 01-2.536 3.179 11.534 11.534 0 003.321-.893z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Twitter);
var _default = ForwardRef;
exports["default"] = _default;