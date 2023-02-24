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

function HandPointerO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 2.286a2.279 2.279 0 00-2.286 2.286v16l-2.696-3.607a2.428 2.428 0 00-1.911-.964c-1.25 0-2.25 1.054-2.25 2.286 0 .5.161.982.464 1.375l6.857 9.143a2.285 2.285 0 001.821.911h12.821c.518 0 .982-.357 1.107-.857l1.643-6.571c.286-1.143.429-2.304.429-3.464v-3.875c0-.946-.732-1.804-1.714-1.804-.946 0-1.714.768-1.714 1.714h-.571V13.77c0-1.125-.857-2.054-2-2.054-1.107 0-2 .893-2 2v1.143h-.571v-1.607c0-1.286-.982-2.393-2.286-2.393a2.279 2.279 0 00-2.286 2.286v1.714h-.571V4.68c0-1.286-.982-2.393-2.286-2.393zm0-2.286C13.983 0 16 2.143 16 4.679v3.929c.196-.018.375-.036.571-.036a4.5 4.5 0 013.089 1.232 4.308 4.308 0 011.768-.375c1.286 0 2.482.571 3.286 1.554a3.85 3.85 0 011-.125c2.25 0 4 1.875 4 4.089v3.875c0 1.339-.161 2.696-.5 4.018l-1.643 6.571A3.42 3.42 0 0124.25 32H11.429a4.653 4.653 0 01-3.661-1.821L.911 21.036A4.623 4.623 0 010 18.286c0-2.5 2.036-4.571 4.536-4.571.821 0 1.625.214 2.321.625V4.572A4.58 4.58 0 0111.428.001zm2.285 25.143v-6.857h-.571v6.857h.571zm4.572 0v-6.857h-.571v6.857h.571zm4.571 0v-6.857h-.571v6.857h.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandPointerO);
var _default = ForwardRef;
exports["default"] = _default;