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

function TrashO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.143 13.143v10.286c0 .321-.25.571-.571.571H7.429a.564.564 0 01-.571-.571V13.143c0-.321.25-.571.571-.571h1.143c.321 0 .571.25.571.571zm4.571 0v10.286c0 .321-.25.571-.571.571H12a.564.564 0 01-.571-.571V13.143c0-.321.25-.571.571-.571h1.143c.321 0 .571.25.571.571zm4.572 0v10.286c0 .321-.25.571-.571.571h-1.143a.564.564 0 01-.571-.571V13.143c0-.321.25-.571.571-.571h1.143c.321 0 .571.25.571.571zm2.285 12.928V9.142h-16v16.929c0 .857.482 1.357.571 1.357h14.857c.089 0 .571-.5.571-1.357zm-12-19.214h8l-.857-2.089a.684.684 0 00-.304-.196H9.749a.608.608 0 00-.304.196zm16.572.572v1.143c0 .321-.25.571-.571.571h-1.714v16.929c0 1.964-1.286 3.643-2.857 3.643H5.144c-1.571 0-2.857-1.607-2.857-3.571v-17H.573a.564.564 0 01-.571-.571V7.43c0-.321.25-.571.571-.571h5.518l1.25-2.982c.357-.875 1.429-1.589 2.375-1.589h5.714c.946 0 2.018.714 2.375 1.589l1.25 2.982h5.518c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TrashO);
var _default = ForwardRef;
exports["default"] = _default;