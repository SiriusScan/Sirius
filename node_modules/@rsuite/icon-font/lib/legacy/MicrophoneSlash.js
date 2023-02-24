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

function MicrophoneSlash(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.839 16.875l-1.804 1.804a10.056 10.056 0 01-.75-3.821v-2.286c0-.625.518-1.143 1.143-1.143s1.143.518 1.143 1.143v2.286c0 .696.107 1.375.268 2.018zm19.893-10.75l-6.446 6.446v2.286c0 3.143-2.571 5.714-5.714 5.714a5.868 5.868 0 01-1.946-.339l-1.714 1.714a7.885 7.885 0 003.661.911c4.411 0 8-3.589 8-8v-2.286c0-.625.518-1.143 1.143-1.143s1.143.518 1.143 1.143v2.286c0 5.286-4 9.643-9.143 10.214v2.357h4.571c.625 0 1.143.518 1.143 1.143s-.518 1.143-1.143 1.143H6.858c-.625 0-1.143-.518-1.143-1.143s.518-1.143 1.143-1.143h4.571v-2.357a10.067 10.067 0 01-4.196-1.446l-4.536 4.536a.571.571 0 01-.821 0L.412 26.697a.571.571 0 010-.821L22.448 3.84a.571.571 0 01.821 0l1.464 1.464a.571.571 0 010 .821zm-6.786-2.357L6.857 14.857V5.714C6.857 2.571 9.428 0 12.571 0c2.464 0 4.571 1.589 5.375 3.768z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(MicrophoneSlash);
var _default = ForwardRef;
exports["default"] = _default;