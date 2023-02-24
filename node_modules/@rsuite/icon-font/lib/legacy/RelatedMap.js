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

function RelatedMap(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M.012 6.588A7 7 0 016.978 0l.003.875A6.126 6.126 0 00.886 6.639l-.874-.051zM7 14v-.875a6.125 6.125 0 006.113-5.745l.873.053a7 7 0 01-6.987 6.566z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M2.625 7.034V7a4.377 4.377 0 013.77-4.334l.12.867A3.5 3.5 0 003.5 6.959v.069l-.875.007zM7 11.375V10.5a3.502 3.502 0 003.466-3.009l.867.121a4.376 4.376 0 01-4.332 3.762zM7 7.875a.875.875 0 100-1.75.875.875 0 000 1.75zm0 .875a1.75 1.75 0 11.001-3.501A1.75 1.75 0 017 8.75zM9.625 2.625a.875.875 0 11-1.75 0 .875.875 0 011.75 0zM5.25 12.25a.875.875 0 11-1.75 0 .875.875 0 011.75 0zM13.125 5.25a.875.875 0 11-1.75 0 .875.875 0 011.75 0zM2.625 8.75a.875.875 0 11-1.75 0 .875.875 0 011.75 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(RelatedMap);
var _default = ForwardRef;
exports["default"] = _default;