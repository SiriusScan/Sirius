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

function CcDinersClub(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.321 22.161V9.786c-2.482.964-4.25 3.375-4.25 6.196s1.768 5.232 4.25 6.179zm9-6.179c0-2.821-1.768-5.232-4.25-6.196v12.393c2.482-.964 4.25-3.375 4.25-6.196zm3.84 0c0 5.768-4.679 10.464-10.464 10.464-5.768 0-10.464-4.696-10.464-10.464 0-5.786 4.696-10.464 10.464-10.464a10.456 10.456 0 0110.464 10.464zm6.839.125c0-6.821-5.696-11.536-11.946-11.536h-5.375c-6.321 0-11.536 4.714-11.536 11.536 0 6.232 5.214 11.321 11.536 11.321h5.375c6.25 0 11.946-5.089 11.946-11.321zm6.143-11.536v22.857a2.302 2.302 0 01-2.286 2.286H2.286A2.302 2.302 0 010 27.428V4.571a2.302 2.302 0 012.286-2.286h36.571a2.302 2.302 0 012.286 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CcDinersClub);
var _default = ForwardRef;
exports["default"] = _default;