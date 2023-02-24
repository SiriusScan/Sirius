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

function Headphones(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.714 15.821c0 1.946-.357 3.839-1.071 5.607l-.357.875-3.304.589a4.565 4.565 0 01-4.411 3.393v.571c0 .321-.25.571-.571.571h-1.143a.564.564 0 01-.571-.571V16.57c0-.321.25-.571.571-.571H20c.321 0 .571.25.571.571v.571c1.714 0 3.196.946 3.982 2.339l1.214-.214a11.68 11.68 0 00.518-3.446c0-5.393-5.339-10.107-11.429-10.107S3.427 10.427 3.427 15.82c0 1.196.179 2.339.518 3.446l1.214.214a4.567 4.567 0 013.982-2.339v-.571c0-.321.25-.571.571-.571h1.143c.321 0 .571.25.571.571v10.286c0 .321-.25.571-.571.571H9.712a.564.564 0 01-.571-.571v-.571a4.564 4.564 0 01-4.411-3.393l-3.304-.589-.357-.875a14.921 14.921 0 01-1.071-5.607c0-7.339 6.804-13.536 14.857-13.536s14.857 6.196 14.857 13.536z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Headphones);
var _default = ForwardRef;
exports["default"] = _default;