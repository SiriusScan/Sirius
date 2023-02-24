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

function Medkit(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 20v-3.429a.564.564 0 00-.571-.571h-4v-4a.564.564 0 00-.571-.571h-3.429a.564.564 0 00-.571.571v4h-4a.564.564 0 00-.571.571V20c0 .321.25.571.571.571h4v4c0 .321.25.571.571.571h3.429c.321 0 .571-.25.571-.571v-4h4c.321 0 .571-.25.571-.571zM11.429 6.857h9.143V4.571h-9.143v2.286zm-6.858 0v22.857H4c-2.196 0-4-1.804-4-4V10.857c0-2.196 1.804-4 4-4h.571zm21.143 0v22.857H6.285V6.857h2.857V4c0-.946.768-1.714 1.714-1.714h10.286c.946 0 1.714.768 1.714 1.714v2.857h2.857zm6.286 4v14.857c0 2.196-1.804 4-4 4h-.571V6.857H28c2.196 0 4 1.804 4 4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Medkit);
var _default = ForwardRef;
exports["default"] = _default;