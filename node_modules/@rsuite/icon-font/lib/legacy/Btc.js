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

function Btc(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 24 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.839 11.429c.232 2.375-.768 3.804-2.339 4.607 2.607.625 4.25 2.179 3.929 5.661-.411 4.339-3.625 5.5-8.232 5.75v4.554h-2.75v-4.482c-.696 0-1.429 0-2.179-.018v4.5h-2.75v-4.554c-.643 0-1.286-.018-1.946-.018H1.001l.554-3.268c2.018.036 1.982 0 1.982 0 .768 0 .982-.554 1.036-.911v-7.179h.286c-.107-.018-.214-.018-.286-.018v-5.125c-.107-.571-.464-1.214-1.589-1.214 0 0 .036-.036-1.982 0V6.785l3.786.018c.554 0 1.143 0 1.732-.018v-4.5h2.75v4.411c.732-.018 1.464-.036 2.179-.036V2.285h2.75v4.5c3.536.304 6.339 1.393 6.643 4.643zM17 21.161c0-3.536-5.821-3.018-7.679-3.018v6.036c1.857 0 7.679.393 7.679-3.018zm-1.268-8.5c0-3.232-4.857-2.75-6.411-2.75v5.482c1.554 0 6.411.357 6.411-2.732z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Btc);
var _default = ForwardRef;
exports["default"] = _default;