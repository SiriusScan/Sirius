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

function Subscript(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 28 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.018 24.446v2.982h-4.429l-2.839-4.5-.429-.75a.944.944 0 01-.196-.375h-.054c-.036.125-.107.25-.161.375-.107.214-.268.5-.446.786l-2.768 4.464H.089v-2.982h2.286l3.518-5.196-3.304-4.857H.143v-3h4.929l2.482 4.071c.161.25.286.518.411.75.107.125.161.25.196.375h.054c.036-.125.107-.25.196-.375l.446-.75 2.5-4.071h4.589v3h-2.232l-3.286 4.768 3.643 5.286h1.946zm11.411 3.875V32H18.25l-.071-.482c-.018-.268-.054-.589-.054-.821 0-4.875 6.25-5.286 6.25-7.875 0-.929-.839-1.554-1.786-1.554-.696 0-1.286.321-1.732.696a5.742 5.742 0 00-.643.679L18.339 21a5.883 5.883 0 011.125-1.179c.75-.607 1.839-1.161 3.357-1.161 2.589 0 4.393 1.518 4.393 3.893 0 4.268-5.929 4.625-6.179 7.196h4.143V28.32h2.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Subscript);
var _default = ForwardRef;
exports["default"] = _default;