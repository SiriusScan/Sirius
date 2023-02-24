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

function Eur(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 18 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.429 23.339l.625 2.839a.554.554 0 01-.357.661c-.071.018-1.732.589-3.875.589-5.571 0-10.054-3.357-11.554-8.607H.572a.575.575 0 01-.571-.571v-2.018c0-.304.25-.571.571-.571h1.179c-.018-.571-.018-1.25.018-1.875H.573a.564.564 0 01-.571-.571v-2.036c0-.321.25-.571.571-.571h1.75c1.589-5 6.161-8.321 11.5-8.321 1.857 0 3.393.393 3.464.411a.66.66 0 01.357.268.6.6 0 01.054.429l-.768 2.839a.535.535 0 01-.679.393c-.018 0-1.232-.304-2.5-.304-3 0-5.518 1.625-6.714 4.286h8.357a.54.54 0 01.446.214.55.55 0 01.125.464l-.429 2.036a.576.576 0 01-.571.464H6.251c-.054.571-.036 1.179 0 1.875h8.196c.179 0 .339.089.446.214a.593.593 0 01.107.482l-.429 2a.572.572 0 01-.554.464H7.106c1.143 2.786 3.714 4.536 6.75 4.536 1.554 0 2.821-.429 2.839-.429a.598.598 0 01.464.036.62.62 0 01.268.375z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Eur);
var _default = ForwardRef;
exports["default"] = _default;