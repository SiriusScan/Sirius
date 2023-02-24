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

function ReviewPass(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.863 8.921l.281-1.464-1.196-2.452-.632.007a2 2 0 111.54-.751l.782.624a2.999 2.999 0 10-5.04-.558 2.998 2.998 0 002.729 1.685L4.33 8.069.606 9.885c-.425.208-.668.912-.46 1.337l.438.899c.438.899 1.776 1.359 2.674.921l.899-.438-.438-.899-.899.438c-.402.196-1.141-.058-1.337-.46l-.438-.899 3.819-1.863zM1.5 15h9a.5.5 0 010 1h-9a.5.5 0 010-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.909 11.042a6 6 0 11-4.867-6.951.5.5 0 11-.173.985 5 5 0 00-5.792 4.056 5 5 0 109.848 1.736.5.5 0 11.985.173z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.55 11.673l5.57-6.499a.5.5 0 11.759.651l-5.991 6.989a.532.532 0 01-.175.137.502.502 0 01-.433-.002l-.012-.006a.528.528 0 01-.163-.135c-.011-.013-.02-.027-.029-.041l-1.993-2.99a.5.5 0 11.832-.554l1.634 2.451z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ReviewPass);
var _default = ForwardRef;
exports["default"] = _default;