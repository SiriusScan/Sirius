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

function IdCardO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 21.643C16 22.947 15.143 24 14.089 24H6.482c-1.054 0-1.911-1.054-1.911-2.357 0-2.357.571-5.071 2.929-5.071.714.714 1.696 1.143 2.786 1.143s2.071-.429 2.786-1.143c2.357 0 2.929 2.714 2.929 5.071zm-2.286-7.929a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zM32 21.143v1.143c0 .321-.25.571-.571.571H18.858a.564.564 0 01-.571-.571v-1.143c0-.321.25-.571.571-.571h12.571c.321 0 .571.25.571.571zm-6.857-4.572v1.143c0 .321-.25.571-.571.571h-5.714a.564.564 0 01-.571-.571v-1.143c0-.321.25-.571.571-.571h5.714c.321 0 .571.25.571.571zm6.857 0v1.143c0 .321-.25.571-.571.571H28a.564.564 0 01-.571-.571v-1.143c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571zM32 12v1.143c0 .321-.25.571-.571.571H18.858a.564.564 0 01-.571-.571V12c0-.321.25-.571.571-.571h12.571c.321 0 .571.25.571.571zm2.286 14.857v-20h-32v20c0 .304.268.571.571.571h30.857a.587.587 0 00.571-.571zm2.285-21.714v21.714a2.866 2.866 0 01-2.857 2.857H2.857A2.866 2.866 0 010 26.857V5.143a2.866 2.866 0 012.857-2.857h30.857a2.866 2.866 0 012.857 2.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(IdCardO);
var _default = ForwardRef;
exports["default"] = _default;