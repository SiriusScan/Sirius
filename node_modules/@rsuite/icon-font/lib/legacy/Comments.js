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

function Comments(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 13.714c0 5.054-5.625 9.143-12.571 9.143-1.089 0-2.143-.107-3.143-.286a15 15 0 01-4.964 2.286c-.482.125-1 .214-1.536.286h-.054c-.268 0-.518-.214-.571-.518-.071-.339.161-.554.357-.786.696-.786 1.482-1.482 2.089-2.964C1.857 19.196 0 16.607 0 13.714 0 8.66 5.625 4.571 12.571 4.571s12.571 4.089 12.571 9.143zM32 18.286c0 2.911-1.857 5.482-4.75 7.161.607 1.482 1.393 2.179 2.089 2.964.196.232.429.446.357.786-.071.321-.339.554-.625.518a12.928 12.928 0 01-1.536-.286 14.971 14.971 0 01-4.964-2.286c-1 .179-2.054.286-3.143.286-3.232 0-6.196-.893-8.429-2.357.518.036 1.054.071 1.571.071 3.839 0 7.464-1.107 10.232-3.107 2.982-2.179 4.625-5.125 4.625-8.321 0-.929-.143-1.839-.411-2.714 3.018 1.661 4.982 4.304 4.982 7.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Comments);
var _default = ForwardRef;
exports["default"] = _default;