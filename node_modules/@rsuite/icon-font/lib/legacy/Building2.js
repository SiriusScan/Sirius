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

function Building2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.094 2C19.132.791 17.667 0 16 0s-3.131.791-4.094 2H4v30h24V2h-7.906zM16 1.001c.553 0 1.001.448 1.001 1.001s-.448.997-1.001.997a.999.999 0 110-1.998zM26 30H6V4h4.919a5.1 5.1 0 00-.169 1.25h10.501c0-.434-.066-.848-.165-1.25H26v26z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.527 18.078V7.079h-2v12.999h16.946v-2zM7.527 22.249h16.946v2H7.527v-2zM7.527 26h16.946v2H7.527v-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.497 12.293l3.71 3.712 4.926-4.926-1.415-1.415-3.511 3.511-3.71-3.71-3.406 3.406-1.152-1.152-1.413 1.413 2.565 2.567z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Building2);
var _default = ForwardRef;
exports["default"] = _default;