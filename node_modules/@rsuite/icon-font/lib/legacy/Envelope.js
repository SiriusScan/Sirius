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

function Envelope(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M32 12.679v14.179a2.866 2.866 0 01-2.857 2.857H2.857A2.866 2.866 0 010 26.858V12.679a10.025 10.025 0 001.804 1.554c2.964 2.018 5.964 4.036 8.875 6.161 1.5 1.107 3.357 2.464 5.304 2.464h.036c1.946 0 3.804-1.357 5.304-2.464 2.911-2.107 5.911-4.143 8.893-6.161.643-.446 1.25-.964 1.786-1.554zm0-5.25c0 2-1.482 3.804-3.054 4.893-2.786 1.929-5.589 3.857-8.357 5.804-1.161.804-3.125 2.446-4.571 2.446h-.036c-1.446 0-3.411-1.643-4.571-2.446-2.768-1.946-5.571-3.875-8.339-5.804-1.268-.857-3.071-2.875-3.071-4.5 0-1.75.946-3.25 2.857-3.25h26.286c1.554 0 2.857 1.286 2.857 2.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Envelope);
var _default = ForwardRef;
exports["default"] = _default;