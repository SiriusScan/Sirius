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

function CartPlus(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M21.714 12.571c0-.625-.518-1.143-1.143-1.143h-2.286V9.142c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143v2.286h-2.286c-.625 0-1.143.518-1.143 1.143s.518 1.143 1.143 1.143h2.286V16c0 .625.518 1.143 1.143 1.143s1.143-.518 1.143-1.143v-2.286h2.286c.625 0 1.143-.518 1.143-1.143zM11.429 27.429c0 1.268-1.018 2.286-2.286 2.286s-2.286-1.018-2.286-2.286 1.018-2.286 2.286-2.286 2.286 1.018 2.286 2.286zm16 0c0 1.268-1.018 2.286-2.286 2.286s-2.286-1.018-2.286-2.286 1.018-2.286 2.286-2.286 2.286 1.018 2.286 2.286zM29.714 8v9.143c0 .571-.429 1.071-1.018 1.143l-18.643 2.179c.071.393.232.839.232 1.25s-.25.786-.429 1.143h16.429c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143H7.999a1.151 1.151 0 01-1.143-1.143c0-.554.839-1.929 1.089-2.446L4.784 6.859H1.141c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143h4.571c1.214 0 1.232 1.429 1.411 2.286h21.446c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CartPlus);
var _default = ForwardRef;
exports["default"] = _default;