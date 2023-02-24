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

function Youtube(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.339 22.214v3.768c0 .804-.232 1.196-.696 1.196-.268 0-.536-.125-.804-.393V21.41c.268-.268.536-.393.804-.393.464 0 .696.411.696 1.196zm6.036.018v.821h-1.607v-.821c0-.804.268-1.214.804-1.214s.804.411.804 1.214zm-17.25-3.893h1.911V16.66H2.465v1.679H4.34V28.5h1.786V18.339zM11.268 28.5h1.589v-8.821h-1.589v6.75c-.357.5-.696.75-1.018.75-.214 0-.339-.125-.375-.375-.018-.054-.018-.25-.018-.625v-6.5H8.268v6.982c0 .625.054 1.036.143 1.304.143.446.518.661 1.036.661.571 0 1.179-.357 1.821-1.089v.964zm7.661-2.643v-3.518c0-.821-.036-1.411-.161-1.768-.196-.661-.643-1-1.268-1-.589 0-1.143.321-1.661.964V16.66H14.25v11.839h1.589v-.857c.536.661 1.089.982 1.661.982.625 0 1.071-.339 1.268-.982.125-.375.161-.964.161-1.786zm6.035-.178v-.232h-1.625c0 .643-.018 1-.036 1.089-.089.429-.321.643-.714.643-.554 0-.821-.411-.821-1.232v-1.554h3.196v-1.839c0-.946-.161-1.625-.482-2.071-.464-.607-1.089-.911-1.893-.911-.821 0-1.446.304-1.911.911-.339.446-.5 1.125-.5 2.071v3.089c0 .946.179 1.643.518 2.071.464.607 1.089.911 1.929.911s1.5-.321 1.929-.946c.196-.286.339-.607.375-.964.036-.161.036-.518.036-1.036zM14.107 9.375v-3.75c0-.821-.232-1.232-.768-1.232-.518 0-.768.411-.768 1.232v3.75c0 .821.25 1.25.768 1.25.536 0 .768-.429.768-1.25zm12.839 13.411c0 2.054-.018 4.25-.464 6.25-.339 1.411-1.482 2.446-2.857 2.589-3.286.375-6.607.375-9.911.375s-6.625 0-9.911-.375c-1.375-.143-2.536-1.179-2.857-2.589-.464-2-.464-4.196-.464-6.25 0-2.071.018-4.25.464-6.25.339-1.411 1.482-2.446 2.875-2.607 3.268-.357 6.589-.357 9.893-.357s6.625 0 9.911.357c1.375.161 2.536 1.196 2.857 2.607.464 2 .464 4.179.464 6.25zM9.125 0h1.821L8.785 7.125v4.839H6.999V7.125C6.838 6.25 6.481 5 5.91 3.339A245.016 245.016 0 014.749 0h1.893L7.91 4.696zm6.607 5.946v3.125c0 .946-.161 1.661-.5 2.107-.446.607-1.071.911-1.893.911-.804 0-1.429-.304-1.875-.911-.339-.464-.5-1.161-.5-2.107V5.946c0-.946.161-1.643.5-2.089.446-.607 1.071-.911 1.875-.911.821 0 1.446.304 1.893.911.339.446.5 1.143.5 2.089zm5.982-2.892v8.911h-1.625v-.982c-.643.75-1.25 1.107-1.839 1.107-.518 0-.893-.214-1.054-.661-.089-.268-.143-.696-.143-1.339V3.054h1.625v6.554c0 .375 0 .589.018.625.036.25.161.393.375.393.321 0 .661-.25 1.018-.768V3.054h1.625z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Youtube);
var _default = ForwardRef;
exports["default"] = _default;