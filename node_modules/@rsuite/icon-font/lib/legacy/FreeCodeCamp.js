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

function FreeCodeCamp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.089 29.232c0 .5-.446.964-.946.964-.071 0-.161-.036-.232-.054-1-.232-2.286-1.732-2.893-2.5C1.232 24.124 0 20.017 0 15.571c0-4.143 1.25-7.696 3.804-10.964.589-.768 2.339-2.786 3.375-2.786.446 0 .911.357.911.821 0 .536-.786 1.268-1.125 1.607-.982 1.018-1.893 2.054-2.625 3.286-1.518 2.536-2.125 5.071-2.125 8.018 0 3.161.589 6.018 2.196 8.768.679 1.161 1.482 2.125 2.429 3.089.375.411 1.25 1.214 1.25 1.821zm23.982-2.393c0 .661-.446 1.214-1.143 1.214H11.624a1.151 1.151 0 01-1.143-1.143c0-.661.446-1.214 1.143-1.214h19.304c.625 0 1.143.518 1.143 1.143zm-3.839-10.91c0 1.5-.339 2.893-1.196 4.161-.589.875-1.786 2-2.732 2.482-.143.089-.321.179-.482.179-.143 0-.411-.161-.411-.321 0-.518 2.179-1.75 2.179-4.143 0-.786-.196-1.661-.625-2.321-.125-.179-.571-.75-.821-.75-.054 0-.054.036-.054.089 0 .429.268.839.268 1.286 0 .571-.696.857-1.179.857-.839 0-1.179-.589-1.179-1.357 0-.518.054-1.054.054-1.571 0-.375-.018-.482-.179-.821-.25-.482-1.071-1.464-1.661-1.464-.161 0-.214 0-.214.161 0 .25.571.518.571 1.429 0 2.375-3.268 2.804-3.268 5.179 0 1.071.143 1.964.75 2.857.375.554.786.875 1.411 1.125.161.054.321.071.321.268s-.161.286-.321.286c-.089 0-.5-.161-.589-.196-2.75-1-4.839-3.393-4.839-6.393 0-3.554 4.268-6.661 4.268-10.071 0-.661-.107-1.125-.446-1.679-.196-.321-.679-.946-1-1.143-.143-.071-.339-.196-.339-.375 0-.304.518-.357.732-.357.643 0 1.375.232 1.964.518 2.482 1.179 3 2.982 3.429 5.482.107.589.321 2.464 1.179 2.464.554 0 .911-.375.911-.911 0-.804-.714-1.679-.714-2.125 0-.125.071-.179.179-.179.446 0 1.375.946 1.661 1.25 1.732 1.839 2.375 3.625 2.375 6.107zm12.911.517c0 3.143-.839 6.286-2.464 8.982-.75 1.25-3.214 4.75-4.839 4.75-.375 0-.821-.464-.821-.839 0-.607 2.089-2.554 2.607-3.214 2.214-2.786 3.268-5.929 3.268-9.482 0-2.929-.357-5.304-1.661-7.964-.804-1.643-1.643-2.75-2.911-4.071-.411-.429-1.304-1.232-1.304-1.875 0-.446.464-.929.911-.929 1.179 0 2.875 2.179 3.5 3.018 2.393 3.214 3.411 6.518 3.679 10.482.018.375.036.768.036 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FreeCodeCamp);
var _default = ForwardRef;
exports["default"] = _default;