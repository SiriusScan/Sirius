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

function PiedPiper(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M41.143 0c-5.196 3.446-5.75 5.946-6.196 6.714-.429.786-.75 3.875-1.5 5.375-.75 1.518-3.482 2.714-4.25 3.214-.75.5-1.821 2.446-2.696 4.125a20.376 20.376 0 00-11.25 2.821s-1.643.946-5.411 3.196c1.893-.625 2.786-1.071 2.786-1.071 4.714-1.804 5.964-2.661 9.768-3.286 2.929-.482 6.714-.089 8.304.125.071 0 .125.036.179.054.25.143.339.446.196.696l-3.464 6.161a.767.767 0 01-.839.393c-.857-.161-2.821-.429-6.321-.429-5.071 0-9.196 1.554-14.179 1.625-4.196.054-5.839-1.661-6.25-2.214 0-.018-.018-.036-.018-.054 0-.071.036-.107.107-.107 0 0 2.464 0 6.625-.982 4.732-9.018 8.946-12.179 13.536-12.179 0 0 4.607 0 5.821 3.982 1.464-2.554 1.821-3.161 1.821-3.161.339-.607 2.25-4.964 5.554-9.089 3.321-4.125 5.821-5.143 7.679-5.911z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PiedPiper);
var _default = ForwardRef;
exports["default"] = _default;