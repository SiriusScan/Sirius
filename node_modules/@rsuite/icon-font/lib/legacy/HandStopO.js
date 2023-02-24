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

function HandStopO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 29 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.714 2.286c-1.107 0-2 .893-2 2V16h-.571V6.571c0-1.107-.893-2-2-2s-2 .893-2 2v14l-2.75-3.661a2.285 2.285 0 00-1.821-.911 2.29 2.29 0 00-2.286 2.286c0 .5.161.982.464 1.375l6.857 9.143a2.285 2.285 0 001.821.911h12.286c.821 0 1.536-.589 1.696-1.393l1.357-7.232a6.74 6.74 0 00.089-1.054v-8.893c0-1.107-.893-2-2-2s-2 .893-2 2v4.857h-.571V6.57c0-1.107-.893-2-2-2s-2 .893-2 2v9.429h-.571V4.285c0-1.107-.893-2-2-2zm0-2.286c1.607 0 3.089.911 3.821 2.357.25-.054.5-.071.75-.071a4.299 4.299 0 014.286 4.286v.304c2.482-.143 4.571 1.768 4.571 4.268v8.893c0 .5-.054 1-.143 1.482l-1.357 7.214a3.985 3.985 0 01-3.929 3.268H11.427a4.653 4.653 0 01-3.661-1.821L.909 21.037a4.623 4.623 0 01-.911-2.75 4.568 4.568 0 014.571-4.571c.75 0 1.661.179 2.286.607v-7.75a4.299 4.299 0 014.286-4.286c.25 0 .5.018.75.071A4.292 4.292 0 0115.712.001z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandStopO);
var _default = ForwardRef;
exports["default"] = _default;