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

function Indent(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.286 14.857a.597.597 0 01-.161.411L.982 20.411a.597.597 0 01-.411.161.587.587 0 01-.571-.571V9.715c0-.304.268-.571.571-.571.143 0 .304.054.411.161l5.143 5.143a.597.597 0 01.161.411zM32 23.429v3.429a.587.587 0 01-.571.571H.572a.587.587 0 01-.571-.571v-3.429c0-.304.268-.571.571-.571h30.857c.304 0 .571.268.571.571zm0-6.858V20a.587.587 0 01-.571.571H12a.587.587 0 01-.571-.571v-3.429c0-.304.268-.571.571-.571h19.429c.304 0 .571.268.571.571zm0-6.857v3.429a.587.587 0 01-.571.571H12a.587.587 0 01-.571-.571V9.714c0-.304.268-.571.571-.571h19.429c.304 0 .571.268.571.571zm0-6.857v3.429a.587.587 0 01-.571.571H.572a.587.587 0 01-.571-.571V2.857c0-.304.268-.571.571-.571h30.857c.304 0 .571.268.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Indent);
var _default = ForwardRef;
exports["default"] = _default;