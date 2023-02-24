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

function ObjectUngroup(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M41.143 13.714h-2.286v11.429h2.286V32h-6.857v-2.286h-16V32h-6.857v-6.857h2.286v-2.286H6.858v2.286H.001v-6.857h2.286V6.857H.001V0h6.857v2.286h16V0h6.857v6.857h-2.286v2.286h6.857V6.857h6.857v6.857zm-4.572-4.571v2.286h2.286V9.143h-2.286zM25.143 2.286v2.286h2.286V2.286h-2.286zm-22.857 0v2.286h2.286V2.286H2.286zm2.285 20.571v-2.286H2.285v2.286h2.286zm22.858-2.286h-2.286v2.286h2.286v-2.286zm-20.572 0h16v-2.286h2.286V6.856h-2.286V4.57h-16v2.286H4.571v11.429h2.286v2.286zM16 29.714v-2.286h-2.286v2.286H16zm22.857 0v-2.286h-2.286v2.286h2.286zm-2.286-4.571V13.714h-2.286v-2.286h-6.857v6.857h2.286v6.857h-6.857v-2.286H16v2.286h2.286v2.286h16v-2.286h2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ObjectUngroup);
var _default = ForwardRef;
exports["default"] = _default;