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

function Usb(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M40.857 14.375c.179.089.286.286.286.482s-.107.393-.286.482l-5.714 3.429a.536.536 0 01-.286.089.574.574 0 01-.286-.071.57.57 0 01-.286-.5V16H18.964c.571.893 1.054 1.946 1.482 2.946.857 1.929 1.732 3.911 2.982 3.911h1.714v-1.714c0-.321.25-.571.571-.571h5.714c.321 0 .571.25.571.571v5.714c0 .321-.25.571-.571.571h-5.714a.564.564 0 01-.571-.571v-1.714h-1.714c-2.732 0-3.964-2.804-5.071-5.268C17.518 17.964 16.643 16 15.428 16H8.999c-.518 1.964-2.304 3.429-4.429 3.429-2.518 0-4.571-2.054-4.571-4.571s2.054-4.571 4.571-4.571c2.125 0 3.911 1.464 4.429 3.429h1.857c1.214 0 2.089-1.964 2.929-3.875 1.107-2.464 2.339-5.268 5.071-5.268h1.911c.482-1.339 1.732-2.286 3.232-2.286a3.43 3.43 0 010 6.858c-1.5 0-2.75-.946-3.232-2.286h-1.911c-1.25 0-2.125 1.982-2.982 3.911-.429 1-.911 2.054-1.482 2.946h19.893V11.43c0-.214.107-.393.286-.5s.411-.089.571.018z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Usb);
var _default = ForwardRef;
exports["default"] = _default;