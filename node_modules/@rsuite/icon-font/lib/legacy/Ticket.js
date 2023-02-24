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

function Ticket(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 8.071l5.643 5.643-10.214 10.214-5.643-5.643zm-3.768 17.483l11.036-11.036a1.132 1.132 0 000-1.607L19.09 6.447c-.429-.429-1.179-.429-1.607 0L6.447 17.483a1.132 1.132 0 000 1.607l6.464 6.464c.214.214.5.321.804.321s.589-.107.804-.321zm15.875-11.375L14.197 30.393c-.893.875-2.357.875-3.232 0l-2.25-2.25c1.339-1.339 1.339-3.518 0-4.857s-3.518-1.339-4.857 0l-2.232-2.25c-.893-.875-.893-2.339 0-3.232L17.822 1.625c.875-.893 2.339-.893 3.232 0l2.232 2.232c-1.339 1.339-1.339 3.518 0 4.857s3.518 1.339 4.857 0l2.25 2.232c.875.893.875 2.357 0 3.232z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Ticket);
var _default = ForwardRef;
exports["default"] = _default;