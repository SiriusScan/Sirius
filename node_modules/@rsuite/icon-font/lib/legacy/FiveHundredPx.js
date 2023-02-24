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

function FiveHundredPx(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.018 27.625l-.107.107a14.5 14.5 0 01-4.625 3.125C18.482 31.607 16.59 32 14.625 32s-3.875-.393-5.661-1.143a14.305 14.305 0 01-4.625-3.125 14.23 14.23 0 01-3.125-4.607C.768 22.036.41 20.911.25 19.75c-.071-.5.625-.607.857-.643.554-.089.929-.054 1 .357.018.018.018.036.018.071.071.357.25 1.429.821 2.839.589 1.464 1.5 2.821 2.714 4.036a12.652 12.652 0 004.036 2.714c1.554.661 3.214 1 4.929 1 1.696 0 3.357-.339 4.929-1a12.793 12.793 0 004.018-2.714l.107-.107a.411.411 0 01.446-.107c.161.036.357.179.589.393.571.589.446.875.304 1.036zm-8.429-10.982l-1.179 1.179 1.125 1.125c.125.125.357.393-.125.875-.196.196-.393.304-.571.304-.125 0-.232-.054-.339-.179l-1.107-1.089-1.179 1.179c-.036.036-.125.089-.268.089-.161 0-.357-.089-.554-.286l-.036-.036c-.125-.107-.321-.304-.321-.518 0-.107.054-.196.143-.304l1.179-1.161-1.179-1.179c-.196-.196-.107-.446.25-.804.214-.214.393-.321.554-.321.089 0 .161.036.232.089l1.161 1.179 1.161-1.161c.196-.196.518-.107.857.232.214.214.446.518.196.786zM25 17.661c0 1.411-.286 2.786-.821 4.071-.536 1.25-1.286 2.357-2.25 3.321s-2.089 1.714-3.339 2.25c-1.286.554-2.661.821-4.071.821s-2.786-.268-4.071-.821c-1.25-.536-2.375-1.286-3.339-2.25s-1.714-2.071-2.232-3.321a5.972 5.972 0 01-.268-.714h-.018c-.161-.5.554-.714.768-.786.518-.161.911-.232 1.071.214.429 1.143 1.089 2.25 1.732 2.982h.018v-6.089a6.006 6.006 0 011.821-4.143 6.403 6.403 0 014.518-1.839c3.5 0 6.339 2.821 6.339 6.286 0 3.5-2.857 6.339-6.339 6.339a6.3 6.3 0 01-2-.286c-.089-.036-.5-.214-.232-1.089.071-.232.286-.911.786-.768.036 0 .911.214 1.375.214 2.482 0 4.429-1.929 4.429-4.393 0-1.161-.464-2.25-1.286-3.054-.821-.821-1.929-1.268-3.125-1.268-1.232 0-2.357.5-3.179 1.429-.714.804-1.143 1.875-1.143 2.857v7.375a8.24 8.24 0 004.321 1.196c2.286 0 4.5-.911 6.089-2.5a8.514 8.514 0 002.5-6.036 8.498 8.498 0 00-2.518-6.054c-1.607-1.607-3.75-2.5-6.054-2.5s-4.464.893-6.071 2.5c-.018.018-1.036 1.071-1.375 1.554L7 13.195c-.214.304-.411.589-1.304.393-.446-.107-.929-.375-.929-.768V.677c0-.321.25-.679.679-.679h15.661c.536 0 .536.75.536.982 0 .25 0 .982-.536.982H6.625v8.625h.018c1-1.054 2.732-2.161 3.75-2.589a10.688 10.688 0 014.125-.821c1.411 0 2.786.268 4.071.821 1.25.536 2.375 1.286 3.339 2.25s1.714 2.071 2.25 3.321c.536 1.304.821 2.661.821 4.089zm-.554-10.375c.339.304.107.625-.232 1.018-.214.214-.446.464-.696.464a.383.383 0 01-.286-.125c-1.286-1.107-2.446-1.857-3.696-2.375-1.554-.679-3.214-1-4.929-1-1.518 0-3.179.304-4.679.875-.464.179-.714-.429-.804-.661-.107-.286-.161-.518-.143-.679.036-.179.125-.304.286-.357 1.464-.643 3.464-1.018 5.339-1.018 1.946 0 3.857.393 5.643 1.143 1.643.696 2.982 1.554 4.196 2.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FiveHundredPx);
var _default = ForwardRef;
exports["default"] = _default;