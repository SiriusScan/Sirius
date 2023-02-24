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

function Bus(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 21.714c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286S3.303 24 4.571 24s2.286-1.018 2.286-2.286zm18.286 0c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286S21.589 24 22.857 24s2.286-1.018 2.286-2.286zm-.822-7.071l-1.286-6.857a1.148 1.148 0 00-1.125-.929H5.517c-.554 0-1.018.393-1.125.929l-1.286 6.857A1.147 1.147 0 004.231 16h18.964c.714 0 1.25-.643 1.125-1.357zM20.286 3.714a.846.846 0 00-.857-.857H8a.857.857 0 000 1.714h11.429a.846.846 0 00.857-.857zm7.143 12.947v10.768h-2.286v2.286c0 1.268-1.018 2.286-2.286 2.286s-2.286-1.018-2.286-2.286v-2.286H6.857v2.286c0 1.268-1.018 2.286-2.286 2.286s-2.286-1.018-2.286-2.286v-2.286H-.001V16.661c0-1.464.125-2.554.446-3.982l1.839-8.107C2.623 1.715 7.623.001 13.713.001s11.089 1.714 11.429 4.571l1.875 8.107c.321 1.429.411 2.518.411 3.982z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Bus);
var _default = ForwardRef;
exports["default"] = _default;