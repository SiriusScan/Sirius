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

function History(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.429 16c0 7.554-6.161 13.714-13.714 13.714a13.688 13.688 0 01-10.554-4.946.593.593 0 01.036-.768l2.446-2.464a.687.687 0 01.446-.161.584.584 0 01.411.214 9.04 9.04 0 007.214 3.554c5.036 0 9.143-4.107 9.143-9.143s-4.107-9.143-9.143-9.143A9.094 9.094 0 007.5 9.303l2.446 2.464a1.1 1.1 0 01.25 1.232 1.144 1.144 0 01-1.054.714h-8A1.151 1.151 0 01-.001 12.57v-8c0-.464.286-.875.714-1.054a1.1 1.1 0 011.232.25L4.266 6.07c2.518-2.375 5.929-3.786 9.446-3.786 7.554 0 13.714 6.161 13.714 13.714zM16 10.857v8c0 .321-.25.571-.571.571H9.715a.564.564 0 01-.571-.571v-1.143c0-.321.25-.571.571-.571h4v-6.286c0-.321.25-.571.571-.571h1.143c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(History);
var _default = ForwardRef;
exports["default"] = _default;