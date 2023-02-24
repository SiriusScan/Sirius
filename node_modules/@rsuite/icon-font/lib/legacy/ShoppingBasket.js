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

function ShoppingBasket(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M34.286 13.714c1.268 0 2.286 1.018 2.286 2.286s-1.018 2.286-2.286 2.286h-.268l-2.054 11.821A2.296 2.296 0 0129.714 32H6.857a2.296 2.296 0 01-2.25-1.893L2.553 18.286h-.268c-1.268 0-2.286-1.018-2.286-2.286s1.018-2.286 2.286-2.286h32zM8.661 28a1.155 1.155 0 001.054-1.232l-.571-7.429c-.054-.625-.607-1.107-1.232-1.054s-1.107.607-1.054 1.232l.571 7.429A1.162 1.162 0 008.572 28h.089zM16 26.857v-7.429c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143v7.429c0 .625.518 1.143 1.143 1.143S16 27.482 16 26.857zm6.857 0v-7.429c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143v7.429c0 .625.518 1.143 1.143 1.143s1.143-.518 1.143-1.143zm6.286.089l.571-7.429c.054-.625-.429-1.179-1.054-1.232s-1.179.429-1.232 1.054l-.571 7.429c-.054.625.429 1.179 1.054 1.232H28c.589 0 1.089-.464 1.143-1.054zM8.5 5.214l-1.661 7.357H4.482l1.804-7.875a4.533 4.533 0 014.446-3.554h2.982c0-.625.518-1.143 1.143-1.143h6.857c.625 0 1.143.518 1.143 1.143h2.982a4.53 4.53 0 014.446 3.554l1.804 7.875h-2.357l-1.661-7.357c-.25-1.054-1.161-1.786-2.232-1.786h-2.982c0 .625-.518 1.143-1.143 1.143h-6.857a1.151 1.151 0 01-1.143-1.143h-2.982c-1.071 0-1.982.732-2.232 1.786z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ShoppingBasket);
var _default = ForwardRef;
exports["default"] = _default;