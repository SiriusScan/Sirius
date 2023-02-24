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

function FortAwesome(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 18v-4a.282.282 0 00-.286-.286H9.429a.282.282 0 00-.286.286v4c0 .161.125.286.286.286h1.714a.282.282 0 00.286-.286zm9.142 0v-4a.282.282 0 00-.286-.286h-1.714a.282.282 0 00-.286.286v4c0 .161.125.286.286.286h1.714a.282.282 0 00.286-.286zm9.143.571V32H18.285v-5.714a3.43 3.43 0 00-6.858 0V32H-.002V18.571c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286v2H4.57V9.428c0-.161.125-.286.286-.286H6.57c.161 0 .286.125.286.286v2h2.286v-2c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286v2h2.286v-2c0-.375.5-.286.732-.286V2.16a1.01 1.01 0 01-.571-.893c0-.536.446-.982.982-.982s.982.446.982.982c0 .375-.232.732-.571.893v.304a6.873 6.873 0 011.482-.179c.732 0 1.429.268 2.036.268.554 0 1.179-.268 1.5-.268.161 0 .286.125.286.286v3.75c0 .429-1.446.5-1.732.5-.661 0-1.286-.268-1.964-.268-.536 0-1.089.089-1.607.214v2.375c.232 0 .732-.089.732.286v2h2.286v-2c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286v2h2.286v-2c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286v11.143h2.286v-2c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FortAwesome);
var _default = ForwardRef;
exports["default"] = _default;