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

function QuestionCircle(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 24.571v-3.429a.564.564 0 00-.571-.571H12a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h3.429c.321 0 .571-.25.571-.571zm4.571-12c0-3.268-3.429-5.714-6.5-5.714-2.911 0-5.089 1.25-6.625 3.804a.561.561 0 00.143.75l2.357 1.786a.55.55 0 00.339.107.564.564 0 00.446-.214c.839-1.071 1.196-1.393 1.536-1.643.304-.214.893-.429 1.536-.429 1.143 0 2.196.732 2.196 1.518 0 .929-.482 1.393-1.571 1.893-1.268.571-3 2.054-3 3.786v.643c0 .321.25.571.571.571h3.429c.321 0 .571-.25.571-.571 0-.411.518-1.286 1.357-1.768 1.357-.768 3.214-1.804 3.214-4.518zM27.429 16c0 7.571-6.143 13.714-13.714 13.714S.001 23.571.001 16 6.144 2.286 13.715 2.286 27.429 8.429 27.429 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(QuestionCircle);
var _default = ForwardRef;
exports["default"] = _default;