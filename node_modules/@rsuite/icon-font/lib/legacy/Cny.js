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

function Cny(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 18 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.768 27.429H7.697a.564.564 0 01-.571-.571v-5.893H1.983a.564.564 0 01-.571-.571v-1.839c0-.321.25-.571.571-.571h5.143v-1.518H1.983a.564.564 0 01-.571-.571v-1.857c0-.304.25-.571.571-.571h3.821L.072 3.146a.644.644 0 010-.571.592.592 0 01.5-.286h3.464c.214 0 .411.125.518.321l3.839 7.589c.429.839.714 1.554 1 2.232.304-.768.696-1.518 1.036-2.304l3.411-7.5a.562.562 0 01.518-.339h3.411c.196 0 .375.107.482.286a.558.558 0 01.018.554L12.68 13.467h3.839c.321 0 .571.268.571.571v1.857c0 .321-.25.571-.571.571H11.34v1.518h5.179c.321 0 .571.25.571.571v1.839c0 .321-.25.571-.571.571H11.34v5.893a.575.575 0 01-.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Cny);
var _default = ForwardRef;
exports["default"] = _default;