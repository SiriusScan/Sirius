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

function KeyboardO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 20.857v1.714a.282.282 0 01-.286.286H4.857a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm2.286-4.571V18a.282.282 0 01-.286.286h-4A.282.282 0 014.571 18v-1.714c0-.161.125-.286.286-.286h4c.161 0 .286.125.286.286zm-2.286-4.572v1.714a.282.282 0 01-.286.286H4.857a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm18.286 9.143v1.714a.282.282 0 01-.286.286H9.428a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h15.429c.161 0 .286.125.286.286zm-11.429-4.571V18a.282.282 0 01-.286.286h-1.714a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm-2.285-4.572v1.714a.282.282 0 01-.286.286H9.429a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm6.857 4.572V18a.282.282 0 01-.286.286h-1.714A.282.282 0 0116 18v-1.714c0-.161.125-.286.286-.286H18c.161 0 .286.125.286.286zM16 11.714v1.714a.282.282 0 01-.286.286H14a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm6.857 4.572V18a.282.282 0 01-.286.286h-1.714a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm6.857 4.571v1.714a.282.282 0 01-.286.286h-1.714a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm-9.143-9.143v1.714a.282.282 0 01-.286.286h-1.714a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm4.572 0v1.714a.282.282 0 01-.286.286h-1.714a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zm4.571 0V18a.282.282 0 01-.286.286h-4a.282.282 0 01-.286-.286v-1.714c0-.161.125-.286.286-.286h2v-4.286c0-.161.125-.286.286-.286h1.714c.161 0 .286.125.286.286zM32 25.143v-16H2.286v16H32zm2.286-16v16A2.279 2.279 0 0132 27.429H2.286A2.279 2.279 0 010 25.143v-16a2.279 2.279 0 012.286-2.286H32a2.279 2.279 0 012.286 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(KeyboardO);
var _default = ForwardRef;
exports["default"] = _default;