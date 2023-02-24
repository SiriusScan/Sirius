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

function Retweet(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 26.857a.587.587 0 01-.571.571H5.143c-.661 0-.571-.696-.571-1.143V15.999H1.143A1.151 1.151 0 010 14.856c0-.268.089-.536.268-.732l5.714-6.857c.214-.25.536-.393.875-.393s.661.143.875.393l5.714 6.857c.179.196.268.464.268.732 0 .625-.518 1.143-1.143 1.143H9.142v6.857h10.286c.161 0 .339.071.446.196l2.857 3.429c.071.107.125.25.125.375zm11.429-7.428c0 .268-.089.536-.268.732l-5.714 6.857c-.214.25-.536.411-.875.411s-.661-.161-.875-.411l-5.714-6.857a1.086 1.086 0 01-.268-.732c0-.625.518-1.143 1.143-1.143h3.429v-6.857H14.858a.564.564 0 01-.446-.214l-2.857-3.429a.619.619 0 01-.125-.357c0-.304.268-.571.571-.571h17.143c.661 0 .571.696.571 1.143v10.286h3.429c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Retweet);
var _default = ForwardRef;
exports["default"] = _default;