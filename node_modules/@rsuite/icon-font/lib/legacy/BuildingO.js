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

function BuildingO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 23.429v1.143a.587.587 0 01-.571.571H5.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm0-4.572V20a.587.587 0 01-.571.571H5.143A.587.587 0 014.572 20v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm4.572 0V20a.587.587 0 01-.571.571H9.715A.587.587 0 019.144 20v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm-4.572-4.571v1.143a.587.587 0 01-.571.571H5.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm13.714 9.143v1.143a.587.587 0 01-.571.571h-1.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571H20c.304 0 .571.268.571.571zM16 18.857V20a.587.587 0 01-.571.571h-1.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm-4.571-4.571v1.143a.587.587 0 01-.571.571H9.715a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zM6.857 9.714v1.143a.587.587 0 01-.571.571H5.143a.587.587 0 01-.571-.571V9.714c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm13.714 9.143V20a.587.587 0 01-.571.571h-1.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571H20c.304 0 .571.268.571.571zM16 14.286v1.143a.587.587 0 01-.571.571h-1.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm-4.571-4.572v1.143a.587.587 0 01-.571.571H9.715a.587.587 0 01-.571-.571V9.714c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zM6.857 5.143v1.143a.587.587 0 01-.571.571H5.143a.587.587 0 01-.571-.571V5.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm13.714 9.143v1.143A.587.587 0 0120 16h-1.143a.587.587 0 01-.571-.571v-1.143c0-.304.268-.571.571-.571H20c.304 0 .571.268.571.571zM16 9.714v1.143a.587.587 0 01-.571.571h-1.143a.587.587 0 01-.571-.571V9.714c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm-4.571-4.571v1.143a.587.587 0 01-.571.571H9.715a.587.587 0 01-.571-.571V5.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm9.142 4.571v1.143a.587.587 0 01-.571.571h-1.143a.587.587 0 01-.571-.571V9.714c0-.304.268-.571.571-.571H20c.304 0 .571.268.571.571zM16 5.143v1.143a.587.587 0 01-.571.571h-1.143a.587.587 0 01-.571-.571V5.143c0-.304.268-.571.571-.571h1.143c.304 0 .571.268.571.571zm4.571 0v1.143a.587.587 0 01-.571.571h-1.143a.587.587 0 01-.571-.571V5.143c0-.304.268-.571.571-.571H20c.304 0 .571.268.571.571zM16 29.714h6.857V2.285H2.286v27.429h6.857v-4c0-.304.268-.571.571-.571h5.714c.304 0 .571.268.571.571v4zm9.143-28.571v29.714c0 .625-.518 1.143-1.143 1.143H1.143A1.151 1.151 0 010 30.857V1.143C0 .518.518 0 1.143 0H24c.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(BuildingO);
var _default = ForwardRef;
exports["default"] = _default;