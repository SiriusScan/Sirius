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

function Random(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.86 10.255a5.502 5.502 0 003.75 1.739l.269.007h1.12a.5.5 0 01.09.992l-.09.008h-1.12a6.5 6.5 0 01-4.75-2.063.5.5 0 11.731-.683zM1.62 2a6.5 6.5 0 015.538 3.096.5.5 0 01-.852.524 5.5 5.5 0 00-4.437-2.614L1.62 3H.5a.5.5 0 01-.09-.992L.5 2h1.12z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.146 10.146a.5.5 0 01.638-.058l.069.058 2 2a.5.5 0 01.058.638l-.058.069-2 2a.5.5 0 01-.765-.638l.058-.069 1.647-1.646-1.647-1.646a.5.5 0 01-.058-.638l.058-.069zM1.62 14a6.5 6.5 0 005.818-3.602l.109-.23 1.316-2.924a5.5 5.5 0 014.776-3.238l.24-.005h1.12a.5.5 0 00.09-.992l-.09-.008h-1.12a6.5 6.5 0 00-5.818 3.602l-.109.23-1.316 2.924a5.5 5.5 0 01-4.776 3.238L1.62 13H.5a.5.5 0 00-.09.992L.5 14h1.12z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.146 5.854a.5.5 0 00.638.058l.069-.058 2-2a.5.5 0 00.058-.638l-.058-.069-2-2a.5.5 0 00-.765.638l.058.069L14.793 3.5l-1.647 1.646a.5.5 0 00-.058.638l.058.069z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Random);
var _default = ForwardRef;
exports["default"] = _default;