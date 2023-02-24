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

function IOs(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.53 2.553c.599-.676 1.005-1.616.896-2.553-.866.032-1.913.535-2.534 1.212-.556.599-1.043 1.556-.913 2.476.964.068 1.95-.457 2.551-1.132v-.003zM12.694 8.5c-.021-2.025 1.777-2.997 1.857-3.047-1.01-1.373-2.585-1.563-3.145-1.585-1.338-.124-2.611.735-3.292.735-.679 0-1.728-.715-2.839-.695A4.252 4.252 0 001.72 5.913c-1.518 2.448-.388 6.076 1.089 8.06.722.973 1.582 2.065 2.714 2.025 1.088-.04 1.499-.656 2.816-.656 1.318 0 1.687.656 2.839.636 1.171-.02 1.914-.991 2.631-1.967.83-1.128 1.169-2.219 1.191-2.275-.026-.011-2.286-.816-2.309-3.237h.003z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(IOs);
var _default = ForwardRef;
exports["default"] = _default;