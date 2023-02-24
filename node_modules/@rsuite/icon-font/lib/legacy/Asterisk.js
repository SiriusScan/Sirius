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

function Asterisk(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.464 18.75a2.298 2.298 0 01.839 3.125l-1.143 1.964a2.298 2.298 0 01-3.125.839l-4.75-2.732v5.482a2.302 2.302 0 01-2.286 2.286h-2.286a2.302 2.302 0 01-2.286-2.286v-5.482l-4.75 2.732c-1.089.625-2.5.25-3.125-.839l-1.143-1.964a2.298 2.298 0 01.839-3.125L7.998 16l-4.75-2.75a2.298 2.298 0 01-.839-3.125l1.143-1.964a2.298 2.298 0 013.125-.839l4.75 2.732V4.572a2.302 2.302 0 012.286-2.286h2.286a2.302 2.302 0 012.286 2.286v5.482l4.75-2.732a2.298 2.298 0 013.125.839l1.143 1.964c.625 1.089.25 2.5-.839 3.125L21.714 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Asterisk);
var _default = ForwardRef;
exports["default"] = _default;