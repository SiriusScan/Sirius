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

function Vcard(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 20.196c0-2.768-.679-5.839-3.5-5.839-.875.5-2.054 1.357-3.357 1.357s-2.482-.857-3.357-1.357c-2.821 0-3.5 3.071-3.5 5.839 0 1.554 1.018 2.661 2.286 2.661h9.143c1.268 0 2.286-1.107 2.286-2.661zm-2.804-9.285c0-2.232-1.821-4.054-4.054-4.054s-4.054 1.821-4.054 4.054c0 2.25 1.821 4.054 4.054 4.054s4.054-1.804 4.054-4.054zM32 20v-1.143a.564.564 0 00-.571-.571H21.143a.564.564 0 00-.571.571V20c0 .321.25.571.571.571h10.286c.321 0 .571-.25.571-.571zm0-4.643v-1a.64.64 0 00-.643-.643H21.214a.64.64 0 00-.643.643v1a.64.64 0 00.643.643h10.143a.64.64 0 00.643-.643zm0-4.5V9.714a.564.564 0 00-.571-.571H21.143a.564.564 0 00-.571.571v1.143c0 .321.25.571.571.571h10.286c.321 0 .571-.25.571-.571zm4.571-5.714v21.714a2.866 2.866 0 01-2.857 2.857h-6.286V28a.564.564 0 00-.571-.571h-1.143a.564.564 0 00-.571.571v1.714H11.429V28a.564.564 0 00-.571-.571H9.715a.564.564 0 00-.571.571v1.714H2.858a2.866 2.866 0 01-2.857-2.857V5.143a2.866 2.866 0 012.857-2.857h30.857a2.866 2.866 0 012.857 2.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Vcard);
var _default = ForwardRef;
exports["default"] = _default;