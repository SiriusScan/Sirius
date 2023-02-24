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

function ExternalLink(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 16.571v5.714A5.145 5.145 0 0120 27.428H5.143A5.145 5.145 0 010 22.285V7.428a5.145 5.145 0 015.143-5.143h12.571c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571H5.143a2.866 2.866 0 00-2.857 2.857v14.857a2.866 2.866 0 002.857 2.857H20a2.866 2.866 0 002.857-2.857V16.57c0-.321.25-.571.571-.571h1.143c.321 0 .571.25.571.571zM32 1.143v9.143c0 .625-.518 1.143-1.143 1.143-.304 0-.589-.125-.804-.339L26.91 7.947 15.267 19.59c-.107.107-.268.179-.411.179s-.304-.071-.411-.179l-2.036-2.036c-.107-.107-.179-.268-.179-.411s.071-.304.179-.411L24.052 5.089l-3.143-3.143a1.137 1.137 0 01-.339-.804c0-.625.518-1.143 1.143-1.143h9.143c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ExternalLink);
var _default = ForwardRef;
exports["default"] = _default;