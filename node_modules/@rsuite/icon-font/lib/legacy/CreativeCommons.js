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

function CreativeCommons(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.804 22.018c2.929 0 4.518-1.786 4.589-1.857.143-.179.179-.446.054-.643l-.804-1.464c-.071-.161-.25-.268-.429-.304a.567.567 0 00-.482.196c-.018 0-1.143 1.196-2.786 1.196-1.804 0-3.107-1.321-3.107-3.161 0-1.821 1.268-3.125 3.036-3.125 1.482 0 2.464 1 2.464 1 .125.125.286.196.464.179s.339-.107.429-.25l.946-1.393a.589.589 0 00-.036-.696c-.054-.071-1.5-1.714-4.339-1.714-3.518 0-6.143 2.589-6.143 6.018 0 3.482 2.571 6.018 6.143 6.018zm11.25 0c2.946 0 4.518-1.786 4.589-1.857a.602.602 0 00.071-.643l-.804-1.464a.624.624 0 00-.446-.304.567.567 0 00-.482.196c-.018 0-1.143 1.196-2.786 1.196-1.804 0-3.107-1.321-3.107-3.161 0-1.821 1.268-3.125 3.036-3.125 1.5 0 2.464 1 2.464 1 .125.125.286.196.464.179s.339-.107.429-.25l.946-1.393a.589.589 0 00-.036-.696c-.054-.071-1.5-1.714-4.339-1.714-3.5 0-6.143 2.589-6.143 6.018 0 3.482 2.571 6.018 6.143 6.018zM16 2.857C8.75 2.857 2.857 8.75 2.857 16S8.75 29.143 16 29.143 29.143 23.25 29.143 16 23.25 2.857 16 2.857zM16 0c8.839 0 16 7.161 16 16s-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CreativeCommons);
var _default = ForwardRef;
exports["default"] = _default;