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

function NewspaperO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 9.143h-6.857V16h6.857V9.143zm2.285 11.428v2.286H9.142v-2.286h11.429zm0-13.714v11.429H9.142V6.857h11.429zM32 20.571v2.286h-9.143v-2.286H32zM32 16v2.286h-9.143V16H32zm0-4.571v2.286h-9.143v-2.286H32zm0-4.572v2.286h-9.143V6.857H32zM4.571 24V6.857H2.285V24c0 .625.518 1.143 1.143 1.143S4.571 24.625 4.571 24zm29.715 0V4.571H6.857V24c0 .393-.071.786-.196 1.143h26.482c.625 0 1.143-.518 1.143-1.143zm2.285-21.714V24a3.43 3.43 0 01-3.429 3.429H3.428A3.43 3.43 0 01-.001 24V4.571H4.57V2.285h32z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(NewspaperO);
var _default = ForwardRef;
exports["default"] = _default;