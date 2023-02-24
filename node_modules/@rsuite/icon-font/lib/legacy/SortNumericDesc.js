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

function SortNumericDesc(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M24.036 5.161c0-1.464-1.196-3.018-2.625-3.018-1.25 0-2.036 1.018-2.036 2.339 0 1.286.821 2.375 2.518 2.375 1.161 0 2.143-.696 2.143-1.696zM13.143 25.714a.656.656 0 01-.179.429l-5.696 5.696C7.143 31.946 7 32 6.857 32s-.286-.054-.411-.161L.732 26.125c-.161-.179-.214-.411-.125-.625s.304-.357.536-.357h3.429V.572c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571v24.571h3.429c.321 0 .571.25.571.571zM26 29.964V32h-8.375v-2.036h2.982V22.25c0-.232.018-.464.018-.643v-.286h-.036l-.125.214a3.275 3.275 0 01-.464.554l-1.107 1.036-1.464-1.536 3.429-3.304h2.196v11.679H26zm.536-23.768c0 3.607-1.964 7.518-6.214 7.518-.804 0-1.464-.125-1.929-.286a8.696 8.696 0 01-.75-.268l.696-2.018c.161.071.357.143.554.196.357.125.821.232 1.339.232 2.143 0 3.25-1.786 3.589-3.643h-.036c-.5.536-1.554.911-2.607.911-2.589 0-4.286-2.036-4.286-4.357 0-2.464 1.893-4.482 4.518-4.482 2.839 0 5.125 2.321 5.125 6.196z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SortNumericDesc);
var _default = ForwardRef;
exports["default"] = _default;