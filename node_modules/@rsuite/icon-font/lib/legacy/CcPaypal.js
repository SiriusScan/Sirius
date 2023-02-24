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

function CcPaypal(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.304 16.179c0 .875-.696 1.536-1.571 1.536-.661 0-1.143-.375-1.143-1.071 0-.875.679-1.571 1.554-1.571.661 0 1.161.411 1.161 1.107zm14.017-2.661c0 1.071-.643 1.286-1.571 1.286l-.571.018.304-1.911c.018-.125.107-.196.232-.196h.321c.607 0 1.286.036 1.286.804zm6.268 2.661c0 .875-.696 1.536-1.554 1.536-.661 0-1.161-.375-1.161-1.071 0-.875.679-1.571 1.554-1.571.661 0 1.161.411 1.161 1.107zM9.161 13.125c0-1.5-1.161-2-2.482-2H3.822a.384.384 0 00-.375.339L2.286 18.75c-.018.143.089.286.232.286h1.357c.196 0 .375-.143.393-.339l.321-1.964c.071-.518.946-.339 1.286-.339 2.036 0 3.286-1.214 3.286-3.268zm5.518 5.571l.732-4.661c.018-.143-.089-.286-.232-.286h-1.357c-.268 0-.286.393-.304.589-.411-.607-1.018-.714-1.696-.714-1.75 0-3.089 1.536-3.089 3.232 0 1.393.875 2.304 2.268 2.304.643 0 1.446-.286 1.893-.786a1.38 1.38 0 00-.071.375c0 .161.071.286.232.286h1.232a.402.402 0 00.393-.339zM22.661 14c0-.125-.107-.25-.232-.25h-1.375a.396.396 0 00-.321.179l-1.893 2.786-.786-2.679a.425.425 0 00-.393-.286h-1.339c-.125 0-.232.125-.232.25 0 .089 1.393 4.125 1.518 4.5-.196.268-1.464 1.929-1.464 2.143 0 .125.107.232.232.232h1.375c.125 0 .25-.071.321-.179l4.554-6.571c.036-.036.036-.071.036-.125zm6.785-.875c0-1.5-1.161-2-2.482-2h-2.839c-.196 0-.375.143-.393.339l-1.161 7.286c-.018.143.089.286.232.286h1.464c.143 0 .25-.107.286-.232l.321-2.071c.071-.518.946-.339 1.286-.339 2.036 0 3.286-1.214 3.286-3.268zm5.518 5.571l.732-4.661c.018-.143-.089-.286-.232-.286h-1.357c-.268 0-.286.393-.304.589-.393-.607-1-.714-1.696-.714-1.75 0-3.089 1.536-3.089 3.232 0 1.393.875 2.304 2.268 2.304.661 0 1.464-.286 1.893-.786-.018.107-.071.268-.071.375 0 .161.071.286.232.286h1.232a.402.402 0 00.393-.339zm3.893-7.303v-.018c0-.143-.107-.25-.232-.25h-1.321a.247.247 0 00-.232.196l-1.161 7.429-.018.036c0 .125.107.25.25.25h1.179a.384.384 0 00.375-.339zM7 13.786c-.143.911-.75 1.018-1.536 1.018l-.589.018.304-1.911a.23.23 0 01.232-.196h.339c.804 0 1.411.107 1.25 1.071zm34.143-9.215v22.857a2.302 2.302 0 01-2.286 2.286H2.286A2.302 2.302 0 010 27.428V4.571a2.302 2.302 0 012.286-2.286h36.571a2.302 2.302 0 012.286 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CcPaypal);
var _default = ForwardRef;
exports["default"] = _default;