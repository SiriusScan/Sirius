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

function Alipay(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 15a114.75 114.75 0 01-3.784-1.919c-.832-.439-3.298-1.727-3.298-1.727s-.192.201-.441.517c-1.231 1.574-2.467 2.491-4.335 2.847-.795.089-1.369-.012-2.235-.314C.772 14.008.02 12.911.001 11.487c-.02-1.449.547-2.654 1.649-3.302 1.191-.698 2.596-.457 3.835-.156.811.197 2.871.911 2.871.911.429-.627.811-1.607 1.144-2.94H3V5h3V4H2.029V3H6V1.114L8 1v2h4v1H8v1h3.5c0 2-.5 3-1.471 4.609 1.859.924 3.988 1.682 5.971 2.318V15zM3.494 8.996c-.527.004-1.075 0-1.649.334-.679.391-1.191.847-1.27 1.756-.063.735.526 1.696 1.149 1.981.12.055.256.227.867.284 1.972.182 3.814-1.112 4.76-2.873-1.259-.695-2.465-1.486-3.856-1.481z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Alipay);
var _default = ForwardRef;
exports["default"] = _default;