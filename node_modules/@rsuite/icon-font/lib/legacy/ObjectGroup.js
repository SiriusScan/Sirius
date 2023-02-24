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

function ObjectGroup(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M36.571 6.857h-2.286v18.286h2.286V32h-6.857v-2.286H6.857V32H0v-6.857h2.286V6.857H0V0h6.857v2.286h22.857V0h6.857v6.857zM32 2.286v2.286h2.286V2.286H32zm-29.714 0v2.286h2.286V2.286H2.286zm2.285 27.428v-2.286H2.285v2.286h2.286zm25.143-2.285v-2.286H32V6.857h-2.286V4.571H6.857v2.286H4.571v18.286h2.286v2.286h22.857zm4.572 2.285v-2.286H32v2.286h2.286zM22.857 11.429h6.857v13.714h-16v-4.571H6.857V6.858h16v4.571zM9.143 18.286h11.429V9.143H9.143v9.143zm18.286 4.571v-9.143h-4.571v6.857h-6.857v2.286H27.43z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ObjectGroup);
var _default = ForwardRef;
exports["default"] = _default;