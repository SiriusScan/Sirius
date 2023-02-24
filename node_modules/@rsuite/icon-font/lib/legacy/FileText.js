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

function FileText(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.214 8.5c.179.179.339.393.5.643h-8.429V.714c.25.161.464.321.643.5zm-8.5 2.929h9.714v18.857c0 .946-.768 1.714-1.714 1.714h-24A1.715 1.715 0 010 30.286V1.715C0 .769.768.001 1.714.001H16v9.714c0 .946.768 1.714 1.714 1.714zm2.857 13.142v-1.143a.564.564 0 00-.571-.571H7.429a.564.564 0 00-.571.571v1.143c0 .321.25.571.571.571H20c.321 0 .571-.25.571-.571zm0-4.571v-1.143a.564.564 0 00-.571-.571H7.429a.564.564 0 00-.571.571V20c0 .321.25.571.571.571H20c.321 0 .571-.25.571-.571zm0-4.571v-1.143a.564.564 0 00-.571-.571H7.429a.564.564 0 00-.571.571v1.143c0 .321.25.571.571.571H20c.321 0 .571-.25.571-.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FileText);
var _default = ForwardRef;
exports["default"] = _default;