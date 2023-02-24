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

function TransgenderAlt(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857.571c0-.321.25-.571.571-.571h5.143c.625 0 1.143.518 1.143 1.143v5.143c0 .321-.25.571-.571.571H28a.564.564 0 01-.571-.571V3.893l-4.536 4.554a10.282 10.282 0 012.25 6.411c0 5.286-4 9.643-9.143 10.214v2.357h1.714c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571H16v1.714c0 .321-.25.571-.571.571h-1.143a.564.564 0 01-.571-.571v-1.714h-1.714a.564.564 0 01-.571-.571V28c0-.321.25-.571.571-.571h1.714v-2.357c-5.143-.571-9.143-4.929-9.143-10.214 0-2.429.857-4.661 2.25-6.411l-.929-.946-1.804 1.982a.586.586 0 01-.804.054l-.857-.786c-.232-.196-.25-.571-.036-.804l1.875-2.054-1.982-2v2.393c0 .321-.25.571-.571.571H.571A.564.564 0 010 6.286V1.143C0 .518.518 0 1.143 0h5.143c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571H3.911l1.893 1.911L7.34 2.517a.586.586 0 01.804-.054l.857.786c.232.196.25.571.036.804L7.43 5.821l1.018 1c1.75-1.393 3.982-2.25 6.411-2.25s4.661.857 6.411 2.25l4.554-4.536h-2.393a.564.564 0 01-.571-.571V.571zm-8 22.286c4.411 0 8-3.589 8-8s-3.589-8-8-8-8 3.589-8 8 3.589 8 8 8z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TransgenderAlt);
var _default = ForwardRef;
exports["default"] = _default;