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

function CcVisa(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M35.268 17.679h-2.464s.25-.661 1.179-3.196c-.018.018.25-.661.393-1.089l.214.982c.554 2.732.679 3.304.679 3.304zM9.482 16.518L8.446 11.25c-.143-.732-.696-.964-1.339-.964H2.321l-.036.232c3.286.839 5.982 2.625 7.196 6zm3.197-6.232l-2.893 7.821-.304-1.589c-.625-1.661-2.143-3.196-3.857-3.893l2.411 9.107h3.125l4.661-11.446h-3.143zm2.482 11.464h2.964l1.857-11.464h-2.964zm13.714-11.179a7.372 7.372 0 00-2.661-.482c-2.929 0-4.982 1.554-5 3.786-.018 1.643 1.464 2.554 2.589 3.107 1.161.554 1.536.929 1.536 1.429 0 .768-.929 1.107-1.768 1.107-1.196 0-1.839-.143-2.786-.589l-.393-.196-.411 2.571c.696.321 1.964.607 3.304.607 3.107.018 5.125-1.536 5.161-3.911 0-1.304-.804-2.286-2.5-3.107-1.036-.518-1.661-.893-1.661-1.429 0-.482.536-.982 1.696-.982.964-.018 1.679.179 2.214.429l.268.143zm7.589-.285h-2.286c-.714 0-1.25.214-1.554.964l-4.393 10.5h3.107c.5-1.411.625-1.714.625-1.714h3.786s.089.393.357 1.714h2.75zm4.679-5.715v22.857a2.302 2.302 0 01-2.286 2.286H2.286A2.302 2.302 0 010 27.428V4.571a2.302 2.302 0 012.286-2.286h36.571a2.302 2.302 0 012.286 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CcVisa);
var _default = ForwardRef;
exports["default"] = _default;