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

function Wheelchair(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 29 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.268 21.196l1.821 3.643C18.714 29.089 14.75 32 10.285 32 4.624 32-.001 27.375-.001 21.714a10.3 10.3 0 016.768-9.661l.304 2.339a7.996 7.996 0 00-4.786 7.321c0 4.411 3.589 8 8 8 4.589 0 8.304-3.929 7.982-8.518zm9.786 1.786l1.036 2.036-4.571 2.286a1.14 1.14 0 01-1.536-.5l-4.268-8.518h-8.429a1.171 1.171 0 01-1.143-1.018L7.429 3.357c-.018-.179.054-.571.107-.75.339-1.232 1.482-2.036 2.75-2.036a2.866 2.866 0 012.857 2.857c0 1.625-1.429 3.018-3.071 2.839l.661 5.161h7.554v2.286h-7.268L11.305 16h8.125c.429 0 .839.25 1.018.625l4.071 8.125z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Wheelchair);
var _default = ForwardRef;
exports["default"] = _default;