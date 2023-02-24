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

function SnapchatSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 20.5a.465.465 0 00-.393-.482c-1.625-.339-2.857-1.482-3.536-2.982a.994.994 0 01-.125-.446c0-.804 2.214-.643 2.214-1.786 0-.482-.589-.786-1.018-.786-.393 0-.714.286-1.125.286a.888.888 0 01-.214-.036c.054-.679.089-1.375.089-2.054 0-.607-.036-1.464-.304-2.036-.857-1.857-2.5-2.946-4.554-2.946-2.232 0-3.929.839-4.911 2.946-.268.571-.321 1.429-.321 2.054 0 .679.054 1.357.107 2.036a1.37 1.37 0 01-.268.036c-.393 0-.732-.286-1.107-.286-.446 0-.982.304-.982.804 0 1.107 2.214.964 2.214 1.768a.987.987 0 01-.125.446c-.696 1.5-1.893 2.625-3.536 2.982a.465.465 0 00-.393.482c0 .839 1.893 1.143 2.464 1.232.161.429.089 1.179.714 1.179.464 0 .911-.179 1.375-.179 1.893 0 2.393 1.696 4.571 1.696 2.268 0 2.696-1.696 4.607-1.696.464 0 .929.161 1.393.161.607 0 .554-.75.696-1.161.571-.089 2.464-.393 2.464-1.232zm4.572-13.071v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SnapchatSquare);
var _default = ForwardRef;
exports["default"] = _default;