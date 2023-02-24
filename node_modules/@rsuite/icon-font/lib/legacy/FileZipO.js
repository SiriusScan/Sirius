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

function FileZipO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 6.857V4.571H9.143v2.286h2.286zm2.285 2.286V6.857h-2.286v2.286h2.286zm-2.285 2.286V9.143H9.143v2.286h2.286zm2.285 2.285v-2.286h-2.286v2.286h2.286zm12.5-6.928c.661.661 1.214 1.982 1.214 2.929v20.571c0 .946-.768 1.714-1.714 1.714h-24A1.715 1.715 0 010 30.286V1.715C0 .769.768.001 1.714.001h16c.946 0 2.268.554 2.929 1.214zm-7.928-4.357v6.714H25c-.107-.304-.268-.607-.393-.732l-5.589-5.589c-.125-.125-.429-.286-.732-.393zm6.857 27.285V11.428h-7.429A1.715 1.715 0 0116 9.714V2.285h-2.286v2.286h-2.286V2.285H2.285v27.429h22.857zM13.946 16.839c1.518 5.125 1.911 6.232 1.911 6.232.089.304.143.607.143.929 0 1.982-1.929 3.429-4.571 3.429S6.858 25.983 6.858 24c0-.321.054-.625.143-.929 0 0 .375-1.107 2.143-7.071v-2.286h2.286V16h1.411c.518 0 .964.339 1.107.839zm-2.517 8.304c1.268 0 2.286-.518 2.286-1.143s-1.018-1.143-2.286-1.143-2.286.518-2.286 1.143 1.018 1.143 2.286 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FileZipO);
var _default = ForwardRef;
exports["default"] = _default;