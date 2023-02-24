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

function Road(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M19.839 17.786v-.071l-.429-5.714a.62.62 0 00-.607-.571h-3.321a.62.62 0 00-.607.571l-.429 5.714v.071c-.018.286.25.5.518.5h4.357c.268 0 .536-.214.518-.5zm13.554 8.339c0 .518-.143 1.304-.821 1.304H20.001c.304 0 .554-.25.536-.571l-.357-4.571a.62.62 0 00-.607-.571h-4.857a.62.62 0 00-.607.571l-.357 4.571a.535.535 0 00.536.571H1.717c-.679 0-.821-.786-.821-1.304 0-.714.196-1.429.464-2.071L8.806 5.411c.179-.446.661-.839 1.143-.839h6.054a.62.62 0 00-.607.571l-.268 3.429a.525.525 0 00.536.571h2.964c.321 0 .554-.25.536-.571l-.268-3.429a.62.62 0 00-.607-.571h6.054c.482 0 .964.393 1.143.839l7.446 18.643c.268.643.464 1.357.464 2.071z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Road);
var _default = ForwardRef;
exports["default"] = _default;