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

function Copyright(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.536 19.179v1.946c0 2.518-4.018 3.446-6.536 3.446-4.893 0-8.571-3.732-8.571-8.661 0-4.839 3.643-8.482 8.482-8.482 1.768 0 6.393.625 6.393 3.464v1.946a.282.282 0 01-.286.286h-2.107a.282.282 0 01-.286-.286v-1.25c0-1.125-2.161-1.643-3.625-1.643-3.339 0-5.661 2.411-5.661 5.875 0 3.589 2.429 6.214 5.804 6.214 1.286 0 3.714-.482 3.714-1.607v-1.25c0-.161.125-.286.268-.286h2.125c.143 0 .286.125.286.286zM13.714 4.571C7.41 4.571 2.285 9.696 2.285 16S7.41 27.429 13.714 27.429 25.143 22.304 25.143 16 20.018 4.571 13.714 4.571zM27.429 16c0 7.571-6.143 13.714-13.714 13.714S.001 23.571.001 16 6.144 2.286 13.715 2.286c7.571 0 13.714 6.143 13.714 13.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Copyright);
var _default = ForwardRef;
exports["default"] = _default;