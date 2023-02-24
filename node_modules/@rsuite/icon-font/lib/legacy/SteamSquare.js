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

function SteamSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.179 11.554c0-1.893-1.554-3.446-3.464-3.446a3.46 3.46 0 00-3.446 3.446A3.448 3.448 0 0018.715 15a3.452 3.452 0 003.464-3.446zm-10.893 10.5A3.521 3.521 0 017.75 25.59a3.526 3.526 0 01-3.125-1.893 71.45 71.45 0 011.75.714c1.429.571 3.071-.125 3.661-1.571a2.805 2.805 0 00-1.571-3.643l-1.464-.589c.232-.054.5-.089.75-.089a3.521 3.521 0 013.536 3.536zM27.429 7.429v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V21.84l3.071 1.232c.464 2.161 2.393 3.786 4.679 3.786a4.81 4.81 0 004.786-4.339l6.161-4.5c3.571 0 6.446-2.893 6.446-6.429a6.432 6.432 0 00-6.446-6.446c-3.518 0-6.393 2.857-6.429 6.375l-4.018 5.75c-.161-.018-.321-.018-.5-.018-.893 0-1.732.232-2.446.661L0 15.787V7.43a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143zm-4.411 4.16a4.31 4.31 0 01-4.321 4.304 4.307 4.307 0 01-4.304-4.304 4.31 4.31 0 014.304-4.321 4.313 4.313 0 014.321 4.321z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SteamSquare);
var _default = ForwardRef;
exports["default"] = _default;