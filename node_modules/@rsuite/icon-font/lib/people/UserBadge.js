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

function UserBadge(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5 8a1 1 0 100-2 1 1 0 000 2zm0 1a2 2 0 11-.001-3.999A2 2 0 015 9z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 9c-.987 0-1.912.747-1.994 1.841L3 11a.5.5 0 01-.992.09L2 11c0-2 1.714-3 3-3 1.24 0 2.878.992 2.994 2.796L8 11a.5.5 0 01-.992.09L7 11c0-1.139-.998-2-2-2zM9.5 8h2a.5.5 0 010 1h-2a.5.5 0 010-1zM9.5 6h3a.5.5 0 010 1h-3a.5.5 0 010-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 2a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2h12zm0 1H2a1 1 0 00-.993.883L1 4v8a1 1 0 00.883.993L2 13h12a1 1 0 00.993-.883L15 12V4a1 1 0 00-.883-.993L14 3z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserBadge);
var _default = ForwardRef;
exports["default"] = _default;