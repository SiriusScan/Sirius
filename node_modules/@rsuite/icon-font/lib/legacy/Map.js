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

function Map(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.143 0c.304 0 .571.268.571.571v26.286a.565.565 0 01-.304.5L.839 31.928a.5.5 0 01-.268.071.587.587 0 01-.571-.571V5.142c0-.214.125-.411.304-.5L8.875.071A.5.5 0 019.143 0zm22.286 0c.304 0 .571.268.571.571v26.286a.565.565 0 01-.304.5l-8.571 4.571a.5.5 0 01-.268.071.587.587 0 01-.571-.571V5.142c0-.214.125-.411.304-.5L31.161.071A.5.5 0 0131.429 0zm-20 0c.089 0 .179.018.25.054l9.143 4.571a.597.597 0 01.321.518v26.286a.587.587 0 01-.571.571.566.566 0 01-.25-.054l-9.143-4.571a.597.597 0 01-.321-.518V.571c0-.304.268-.571.571-.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Map);
var _default = ForwardRef;
exports["default"] = _default;