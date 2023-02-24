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

function Slack(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.125 13.857c1.464 0 2.589 1.071 2.589 2.536 0 1.143-.589 1.946-1.661 2.321l-3.071 1.054 1 2.982c.089.268.125.554.125.839 0 1.411-1.143 2.589-2.554 2.589a2.595 2.595 0 01-2.482-1.768l-.982-2.946-5.536 1.893.982 2.929c.089.268.143.554.143.839 0 1.393-1.143 2.589-2.571 2.589a2.572 2.572 0 01-2.464-1.768l-.982-2.911-2.732.946a3.04 3.04 0 01-.893.161c-1.446 0-2.536-1.071-2.536-2.518 0-1.107.714-2.107 1.768-2.464l2.786-.946-1.875-5.589-2.786.964a2.882 2.882 0 01-.857.143C1.107 15.732 0 14.643 0 13.214c0-1.107.714-2.107 1.768-2.464l2.804-.946-.946-2.839a2.682 2.682 0 01-.143-.839c0-1.411 1.143-2.589 2.571-2.589 1.125 0 2.107.696 2.464 1.768l.964 2.857 5.536-1.875-.964-2.857a2.682 2.682 0 01-.143-.839c0-1.411 1.161-2.589 2.571-2.589 1.125 0 2.125.714 2.482 1.768l.946 2.875 2.893-.982c.25-.071.5-.107.768-.107 1.393 0 2.589 1.036 2.589 2.464 0 1.107-.857 2.036-1.857 2.375l-2.804.964 1.875 5.643 2.929-1c.268-.089.554-.143.821-.143zm-14.179 4.679l5.536-1.875-1.875-5.625-5.536 1.911z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Slack);
var _default = ForwardRef;
exports["default"] = _default;