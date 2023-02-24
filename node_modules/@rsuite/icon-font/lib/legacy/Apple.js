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

function Apple(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M24.875 21.696c-.446 1.411-1.161 2.911-2.196 4.464-1.536 2.339-3.071 3.5-4.589 3.5-.607 0-1.429-.196-2.5-.571-1.054-.393-1.964-.571-2.696-.571-.714 0-1.571.196-2.536.589-.982.411-1.768.607-2.357.607-1.839 0-3.607-1.554-5.375-4.625C.894 22.018.001 19.035.001 16.107c0-2.732.679-4.946 2.018-6.679C3.358 7.714 5.037 6.857 7.09 6.857c.875 0 1.911.179 3.161.536 1.232.357 2.054.536 2.464.536.518 0 1.375-.196 2.554-.607 1.179-.393 2.214-.607 3.089-.607 1.429 0 2.696.393 3.804 1.161.625.429 1.25 1.036 1.857 1.786-.929.786-1.607 1.482-2.036 2.107a6.346 6.346 0 00-1.161 3.696c0 1.464.411 2.804 1.232 3.982s1.768 1.929 2.821 2.25zM18.161.75c0 .732-.179 1.554-.518 2.429-.357.893-.911 1.714-1.661 2.464-.643.643-1.286 1.071-1.929 1.286-.411.125-1.018.232-1.857.304.036-1.768.5-3.304 1.393-4.589S15.982.483 18.053.001c.036.161.071.286.089.393 0 .125.018.232.018.357z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Apple);
var _default = ForwardRef;
exports["default"] = _default;