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

function HddO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.571 21.714c0 .786-.643 1.429-1.429 1.429s-1.429-.643-1.429-1.429.643-1.429 1.429-1.429 1.429.643 1.429 1.429zm4.572 0c0 .786-.643 1.429-1.429 1.429s-1.429-.643-1.429-1.429.643-1.429 1.429-1.429 1.429.643 1.429 1.429zm2 2.857v-5.714a.587.587 0 00-.571-.571H2.858a.587.587 0 00-.571.571v5.714c0 .304.268.571.571.571h21.714a.587.587 0 00.571-.571zM3.179 16H24.25l-2.804-8.607c-.089-.304-.429-.536-.75-.536H6.732c-.321 0-.661.232-.75.536zm24.25 2.857v5.714a2.866 2.866 0 01-2.857 2.857H2.858a2.866 2.866 0 01-2.857-2.857v-5.714c0-.482.143-.893.286-1.339L3.805 6.697a3.112 3.112 0 012.929-2.125h13.964c1.321 0 2.518.875 2.929 2.125l3.518 10.821c.143.446.286.857.286 1.339z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HddO);
var _default = ForwardRef;
exports["default"] = _default;