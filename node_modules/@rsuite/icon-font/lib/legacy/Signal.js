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

function Signal(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.571 25.714v3.429c0 .321-.25.571-.571.571H.571A.564.564 0 010 29.143v-3.429c0-.321.25-.571.571-.571H4c.321 0 .571.25.571.571zm6.858-2.285v5.714c0 .321-.25.571-.571.571H7.429a.564.564 0 01-.571-.571v-5.714c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zm6.857-4.572v10.286c0 .321-.25.571-.571.571h-3.429a.564.564 0 01-.571-.571V18.857c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zM25.143 12v17.143c0 .321-.25.571-.571.571h-3.429a.564.564 0 01-.571-.571V12c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zM32 2.857v26.286c0 .321-.25.571-.571.571H28a.564.564 0 01-.571-.571V2.857c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Signal);
var _default = ForwardRef;
exports["default"] = _default;