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

function WindowCloseO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.446 19.839l-2.607 2.607a.571.571 0 01-.821 0L16 19.428l-3.018 3.018a.571.571 0 01-.821 0l-2.607-2.607a.571.571 0 010-.821L12.572 16l-3.018-3.018a.571.571 0 010-.821l2.607-2.607a.571.571 0 01.821 0L16 12.572l3.018-3.018a.571.571 0 01.821 0l2.607 2.607a.571.571 0 010 .821L19.428 16l3.018 3.018a.571.571 0 010 .821zM4.571 25.143h22.857V6.857H4.571v18.286zM32 5.143v21.714a2.866 2.866 0 01-2.857 2.857H2.857A2.866 2.866 0 010 26.857V5.143a2.866 2.866 0 012.857-2.857h26.286A2.866 2.866 0 0132 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(WindowCloseO);
var _default = ForwardRef;
exports["default"] = _default;