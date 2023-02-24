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

function FileAudioO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.214 6.786c.661.661 1.214 1.982 1.214 2.929v20.571c0 .946-.768 1.714-1.714 1.714h-24A1.715 1.715 0 010 30.286V1.715C0 .769.768.001 1.714.001h16c.946 0 2.268.554 2.929 1.214zm-7.928-4.357v6.714H25c-.107-.304-.268-.607-.393-.732l-5.589-5.589c-.125-.125-.429-.286-.732-.393zm6.857 27.285V11.428h-7.429A1.715 1.715 0 0116 9.714V2.285H2.286v27.429h22.857zM11.071 15.179a.585.585 0 01.357.536v9.714a.586.586 0 01-.357.536.888.888 0 01-.214.036.63.63 0 01-.411-.161l-2.964-2.982H5.143a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h2.339l2.964-2.982a.584.584 0 01.625-.125zm7.447 12.303c.339 0 .661-.143.893-.429 1.482-1.821 2.304-4.125 2.304-6.482s-.821-4.661-2.304-6.482a1.14 1.14 0 00-1.607-.179 1.144 1.144 0 00-.161 1.625c1.161 1.429 1.786 3.179 1.786 5.036s-.625 3.607-1.786 5.036a1.12 1.12 0 00.161 1.607c.214.179.464.268.714.268zm-3.768-2.643c.304 0 .607-.125.839-.357a5.694 5.694 0 000-7.822 1.154 1.154 0 00-1.625-.054 1.154 1.154 0 00-.036 1.625c.589.643.929 1.464.929 2.339s-.339 1.696-.929 2.339a1.153 1.153 0 00.036 1.625c.232.196.518.304.786.304z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FileAudioO);
var _default = ForwardRef;
exports["default"] = _default;