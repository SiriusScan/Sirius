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

function ListAlt(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 21.143v1.143a.587.587 0 01-.571.571H5.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm0-4.572v1.143a.587.587 0 01-.571.571H5.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm0-4.571v1.143a.587.587 0 01-.571.571H5.143a.587.587 0 01-.571-.571V12c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm20.572 9.143v1.143a.587.587 0 01-.571.571H9.715a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h17.143c.304 0 .571.268.571.571zm0-4.572v1.143a.587.587 0 01-.571.571H9.715a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h17.143c.304 0 .571.268.571.571zm0-4.571v1.143a.587.587 0 01-.571.571H9.715a.587.587 0 01-.571-.571V12c0-.304.268-.571.571-.571h17.143c.304 0 .571.268.571.571zm2.285 12.571V9.714a.587.587 0 00-.571-.571H2.857a.587.587 0 00-.571.571v14.857c0 .304.268.571.571.571h26.286a.587.587 0 00.571-.571zM32 5.143v19.429a2.866 2.866 0 01-2.857 2.857H2.857A2.866 2.866 0 010 24.572V5.143a2.866 2.866 0 012.857-2.857h26.286A2.866 2.866 0 0132 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ListAlt);
var _default = ForwardRef;
exports["default"] = _default;