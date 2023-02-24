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

function WikipediaW(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.679 29.268l-5.268-12.411c-2.089 4.089-4.393 8.357-6.375 12.411-.018.018-.964 0-.964-.018-3.018-7.054-6.179-14.054-9.196-21.125-.732-1.714-3.179-4.5-4.857-4.482 0-.196-.018-.643-.018-.911h10.411v.893c-1.232.071-3.393.857-2.786 2.196 1.411 3.196 6.661 15.446 8.071 18.554.964-1.911 3.714-7.018 4.839-9.179-.893-1.821-3.768-8.607-4.679-10.286-.625-1.143-2.321-1.25-3.589-1.268v-.893l9.161.018v.839c-1.25.036-2.446.5-1.893 1.679 1.214 2.571 1.964 4.375 3.089 6.732.357-.696 2.232-4.464 3.089-6.482.571-1.321-.25-1.839-2.482-1.893.018-.232 0-.661.018-.875 2.857-.018 7.143-.018 7.911-.036v.875c-1.446.054-2.946.821-3.732 2.036l-3.804 7.893c.411 1.036 4.071 9.179 4.446 10.071l7.875-18.161c-.554-1.482-2.339-1.804-3.036-1.821v-.893l8.214.071.018.036-.018.786c-1.804.054-2.893 1.018-3.589 2.589-1.607 3.714-6.643 15.429-9.982 23.054h-.875z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(WikipediaW);
var _default = ForwardRef;
exports["default"] = _default;