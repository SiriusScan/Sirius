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

function Gamepad(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14.857 19.429v-2.286a.564.564 0 00-.571-.571h-3.429v-3.429a.564.564 0 00-.571-.571H8a.564.564 0 00-.571.571v3.429H4a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571h3.429v3.429c0 .321.25.571.571.571h2.286c.321 0 .571-.25.571-.571V20h3.429c.321 0 .571-.25.571-.571zm10.286 1.142c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zM29.714 16c0-1.268-1.018-2.286-2.286-2.286S25.142 14.732 25.142 16s1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm4.572 2.286a9.137 9.137 0 01-9.143 9.143 9.123 9.123 0 01-6.036-2.286h-3.929a9.12 9.12 0 01-6.036 2.286c-5.054 0-9.143-4.089-9.143-9.143s4.089-9.143 9.143-9.143h16a9.137 9.137 0 019.143 9.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Gamepad);
var _default = ForwardRef;
exports["default"] = _default;