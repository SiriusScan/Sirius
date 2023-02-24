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

function FirstOrder(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M23.607 16c0 .464-.018.911-.089 1.357l-4.214-.25 4 1.393a9.804 9.804 0 01-1.036 2.518l-3.821-1.839L21.608 22a9.34 9.34 0 01-1.911 1.929l-2.804-3.179 1.839 3.839a10.03 10.03 0 01-2.5 1.054l-1.411-4.071.25 4.286a8.568 8.568 0 01-2.714 0l.25-4.25-1.393 4.036a9.37 9.37 0 01-2.5-1.054l1.839-3.839-2.804 3.179a9.405 9.405 0 01-1.929-1.929l3.179-2.821-3.821 1.857a10.4 10.4 0 01-1.036-2.518l4-1.411-4.232.25c-.054-.446-.089-.893-.089-1.357s.036-.929.089-1.375l4.25.25-4.018-1.411a9.95 9.95 0 011.036-2.5l3.821 1.857-3.161-2.839a10.3 10.3 0 011.911-1.929l2.821 3.179-1.839-3.839a9.986 9.986 0 012.5-1.036l1.375 4-.232-4.214a8.568 8.568 0 012.696 0l-.25 4.232 1.393-4.018a9.37 9.37 0 012.5 1.054l-1.839 3.821 2.821-3.179a10.3 10.3 0 011.911 1.929l-3.161 2.839 3.804-1.857a9.477 9.477 0 011.036 2.518l-4 1.393 4.232-.25a8.8 8.8 0 01.089 1.375zm.536 0c0-5.804-4.679-10.5-10.429-10.5C7.946 5.5 3.285 10.196 3.285 16c0 5.786 4.661 10.482 10.429 10.482 5.75 0 10.429-4.696 10.429-10.482zm1.303-6.839V22.84l-11.732 6.839L1.982 22.84V9.161l11.732-6.839zM13.714 30.696l12.643-7.357V8.643L13.714 1.304 1.071 8.643v14.696zM27.429 8v16l-13.714 8L.001 24V8l13.714-8z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FirstOrder);
var _default = ForwardRef;
exports["default"] = _default;