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

function Global(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M7.5 15a6.5 6.5 0 100-13 6.5 6.5 0 000 13zm0 1a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.585 5.04a8.084 8.084 0 01-.785-.426L2 4l.5-.5h.442c.263.208.603.413.988.6C4.558 2.615 5.543 1.333 7 1.09V2c-.879 0-1.682 1.037-2.236 2.453C5.657 4.78 6.658 5 7.5 5c1.528 0 3.574-.721 4.558-1.5h.442l.5.5-.8.614C10.982 5.372 9.084 6 7.5 6c-.976 0-2.072-.238-3.054-.599A11.618 11.618 0 004 8.5C4 11.436 5.371 15 7 15v.98c-3-.5-4-5.48-4-7.48 0-.828.171-2.154.585-3.46z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.236 12.547C9.343 12.22 8.342 12 7.5 12c-1.528 0-3.574.721-4.558 1.5H2.5L2 13l.8-.614C4.018 11.628 5.916 11 7.5 11c.976 0 2.072.238 3.054.599.282-.992.446-2.083.446-3.099C11 5.564 9.629 2 8 2v-.91c3 .5 4 5.41 4 7.41 0 .823-.169 2.151-.578 3.463.28.134.542.276.778.423L13 13l-.5.5h-.442a5.46 5.46 0 00-.975-.594C10.456 14.42 9.467 15.736 8 15.98V15c.879 0 1.682-1.037 2.236-2.453z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 8V2h1v6h6v1H8v6H7V9H1V8z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Global);
var _default = ForwardRef;
exports["default"] = _default;