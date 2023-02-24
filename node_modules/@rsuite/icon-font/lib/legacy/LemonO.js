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

function LemonO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.125 14.75c0-.839-.161-3.036-.446-3.75-.339-.857-.536-1.339-.536-2.304 0-.821.179-1.625.179-2.429 0-.339-.018-.696-.179-.982-.071-.018-.161-.018-.232-.018-.696 0-1.393.161-2.089.161-2.125 0-4.143-.857-6.268-.857-1.661 0-3.268.625-4.804 1.232-1.214.482-2.554 1.054-3.607 1.839-3.607 2.732-4.857 7.732-4.857 12.036 0 1.446.446 2.857.446 4.304 0 .821-.393 1.571-.393 2.357 0 .5.286.911.821.911.875 0 1.714-.393 2.607-.393 2.036 0 4.018.554 6.054.554 1.589 0 3.589-.125 5.071-.643 4.696-1.661 8.232-7.089 8.232-12.018zm2.286-.036c0 5.946-4.125 12.214-9.768 14.214-1.768.625-3.964.786-5.821.786-2.036 0-4.036-.518-6.054-.518-.857 0-1.714.518-2.607.518-1.768 0-3.107-1.589-3.107-3.286 0-.839.393-1.589.393-2.411 0-1.446-.446-2.857-.446-4.321 0-5.071 1.554-10.679 5.768-13.875 1.214-.929 2.732-1.589 4.143-2.143 1.821-.732 3.661-1.393 5.643-1.393 2.125 0 4.143.857 6.232.857.679 0 1.357-.179 2.054-.179 2.036 0 2.768 1.446 2.768 3.304 0 .804-.179 1.625-.179 2.429 0 .643.161.893.375 1.464.411 1.036.607 3.411.607 4.554z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LemonO);
var _default = ForwardRef;
exports["default"] = _default;