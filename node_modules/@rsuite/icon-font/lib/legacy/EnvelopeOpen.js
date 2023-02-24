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

function EnvelopeOpen(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M32 11.679v17.464A2.866 2.866 0 0129.143 32H2.857A2.866 2.866 0 010 29.143V11.679c0-.161.071-.321.196-.429C2.071 9.607 2.089 9.411 11.41 2.607 12.535 1.786 14.517 0 15.999 0s3.482 1.804 4.589 2.607c9.321 6.804 9.339 7 11.214 8.643a.57.57 0 01.196.429zM21.929 22.125c2.786-2.018 4.732-3.429 6.161-4.5a.548.548 0 00.107-.786l-.679-.929a.571.571 0 00-.804-.107c-1.411 1.036-3.339 2.464-6.125 4.464-1.107.804-3.107 2.589-4.589 2.589s-3.482-1.786-4.589-2.589a1204.379 1204.379 0 01-6.125-4.464.572.572 0 00-.804.107l-.679.929a.55.55 0 00.107.786c1.429 1.071 3.375 2.482 6.161 4.5 1.393 1 3.589 3.018 5.929 3.018 2.357 0 4.607-2.054 5.929-3.018z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(EnvelopeOpen);
var _default = ForwardRef;
exports["default"] = _default;