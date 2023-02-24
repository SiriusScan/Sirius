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

function Gift(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.571 24.214V11.428h-5.714v12.786c0 .625.518.929 1.143.929h3.429c.625 0 1.143-.304 1.143-.929zM8.429 9.143h3.482l-2.25-2.875a1.636 1.636 0 00-1.232-.554 1.715 1.715 0 000 3.428zm12.285-1.714c0-.946-.768-1.714-1.714-1.714-.607 0-1.036.321-1.232.554l-2.232 2.875H19c.946 0 1.714-.768 1.714-1.714zM27.429 12v5.714c0 .321-.25.571-.571.571h-1.714v7.429c0 .946-.768 1.714-1.714 1.714H4.001a1.715 1.715 0 01-1.714-1.714v-7.429H.573a.564.564 0 01-.571-.571V12c0-.321.25-.571.571-.571H8.43c-2.214 0-4-1.786-4-4s1.786-4 4-4c1.196 0 2.304.5 3 1.375l2.286 2.946 2.286-2.946c.696-.875 1.804-1.375 3-1.375 2.214 0 4 1.786 4 4s-1.786 4-4 4h7.857c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Gift);
var _default = ForwardRef;
exports["default"] = _default;