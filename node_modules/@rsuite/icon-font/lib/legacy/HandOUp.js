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

function HandOUp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 28.571c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143.518 1.143 1.143 1.143 1.143-.518 1.143-1.143zm2.286-13.642c0-2.018-.821-3.375-2.982-3.375-.339 0-.679.036-1 .089-.411-.75-1.429-1.161-2.25-1.161a2.49 2.49 0 00-1.232.321c-.571-.607-1.286-.946-2.125-.946-.571 0-1.411.25-1.839.625V4.571c0-1.232-1.054-2.286-2.286-2.286-1.214 0-2.286 1.089-2.286 2.286v10.286c-1.125 0-2.286-1.714-4.571-1.714-1.714 0-2.286 1.339-2.286 2.857 0 .5 2.071 1.411 2.482 1.607.393.214.786.429 1.161.661.946.589 1.768 1.268 2.589 2 1.304 1.143 2.911 2.411 2.911 4.304v.571h11.429v-.571c0-3.125 2.286-6.179 2.286-9.643zm2.286-.09c0 2-.554 3.893-1.232 5.75-.393 1.089-1.054 2.857-1.054 3.982v5.143A2.279 2.279 0 0122.857 32H11.428a2.279 2.279 0 01-2.286-2.286v-5.143c0-.857-1.536-2.071-2.125-2.589-.732-.643-1.464-1.25-2.304-1.786C3.052 19.16-.001 18.392-.001 16c0-2.839 1.554-5.143 4.571-5.143.786 0 1.554.125 2.286.393V4.571C6.856 2.107 8.945 0 11.41 0c2.5 0 4.589 2.071 4.589 4.571v3.018a5.02 5.02 0 012.125.661c.25-.036.518-.054.768-.054 1.143 0 2.286.375 3.179 1.071 3.375-.036 5.357 2.268 5.357 5.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandOUp);
var _default = ForwardRef;
exports["default"] = _default;