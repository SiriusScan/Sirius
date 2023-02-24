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

function Tools(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.538 1.048a3 3 0 00-3.265 4.205l.291.633-8.15 8.15.707.707 8.182-8.182.608.237a3 3 0 004.023-3.423l-1.427 1.427a1.5 1.5 0 01-2.121 0l-.24-.24a1.5 1.5 0 010-2.121l1.391-1.391zM8.365 5.671A4 4 0 0114.284.716l-2.431 2.431a.5.5 0 000 .707l.24.24a.5.5 0 00.707 0l2.44-2.44a4 4 0 01-4.691 6.075L2.828 15.45a.999.999 0 01-1.414 0l-.707-.707a.999.999 0 010-1.414l7.658-7.658z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.5 9.914l-.586.586L14 14.586l.586-.586L10.5 9.914zm.707-.707l4.086 4.086a.999.999 0 010 1.414l-.586.586a.999.999 0 01-1.414 0l-4.086-4.086a.999.999 0 010-1.414l.586-.586a.999.999 0 011.414 0zM1.27 1.144l-.126.126.543 1.629 1.212-1.212-1.629-.543zM2 4H1L0 1l1-1 3 1v1l-.646.646 4.5 4.5-.707.707-4.5-4.5-.646.646z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Tools);
var _default = ForwardRef;
exports["default"] = _default;