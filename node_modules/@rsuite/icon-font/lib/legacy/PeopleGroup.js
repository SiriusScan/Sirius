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

function PeopleGroup(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M23.616 9.563c1.801 0 3.266 1.465 3.266 3.266s-1.465 3.266-3.266 3.266-3.269-1.465-3.269-3.266 1.467-3.266 3.269-3.266zm0-2.07a5.337 5.337 0 105.337 5.337 5.336 5.336 0 00-5.337-5.337zM23.616 21.867c4.409 0 6.235.402 6.501 4.482H17.116c.265-4.08 2.091-4.482 6.501-4.482zm0-1.849c-4.551 0-8.256.43-8.382 7.058-.002.117-.002 1.122-.002 1.122H32s0-1.006-.002-1.122c-.126-6.629-3.829-7.058-8.382-7.058zM16.245 10.089a6.288 6.288 0 11-12.575 0 6.288 6.288 0 0112.575 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.37 21.152c-1.762-2.359-4.869-2.592-8.416-2.592-5.403 0-9.801.507-9.952 8.318L0 28.199h16.35l.002-1.186c.057-2.992.807-4.782 2.018-5.861z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PeopleGroup);
var _default = ForwardRef;
exports["default"] = _default;