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

function AudioDescription(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9 17.75h3.054l-.018-4.732zm18.321-1.768c0-1.982-1.143-3.446-3.518-3.446h-.964v6.929h.929c2.232 0 3.554-1.625 3.554-3.482zM17.071 9.25l.018 13.5a.599.599 0 01-.589.607h-3.857a.599.599 0 01-.589-.607v-1.107H6.858l-.982 1.446a.618.618 0 01-.5.268H.608c-.5 0-.786-.554-.482-.946l9.929-13.518a.569.569 0 01.482-.25h5.929c.339 0 .607.268.607.607zm14.768 6.732c0 4.696-3.429 7.375-8.036 7.375h-4.821a.602.602 0 01-.607-.607V9.25c0-.339.268-.607.607-.607h4.786c4.643 0 8.071 2.643 8.071 7.339zm2.786.018s.071 4.643-2.643 7.375h-.911c2.429-2.893 2.482-7.393 2.482-7.393s.036-3.536-2.411-7.321h.768C34.553 11.679 34.624 16 34.624 16zm3.286 0s.071 4.643-2.661 7.375h-.911c2.429-2.893 2.482-7.393 2.482-7.393s.036-3.536-2.393-7.321h.768C37.839 11.679 37.91 16 37.91 16zm3.232 0s.071 4.643-2.643 7.375h-.911c2.411-2.893 2.464-7.393 2.464-7.393s.036-3.536-2.393-7.321h.768C41.071 11.679 41.142 16 41.142 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(AudioDescription);
var _default = ForwardRef;
exports["default"] = _default;