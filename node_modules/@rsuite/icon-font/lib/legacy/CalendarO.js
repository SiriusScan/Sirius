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

function CalendarO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M2.286 29.714h25.143V11.428H2.286v18.286zM9.143 8V2.857a.564.564 0 00-.571-.571H7.429a.564.564 0 00-.571.571V8c0 .321.25.571.571.571h1.143c.321 0 .571-.25.571-.571zm13.714 0V2.857a.564.564 0 00-.571-.571h-1.143a.564.564 0 00-.571.571V8c0 .321.25.571.571.571h1.143c.321 0 .571-.25.571-.571zm6.857-1.143v22.857A2.302 2.302 0 0127.428 32H2.285a2.302 2.302 0 01-2.286-2.286V6.857a2.302 2.302 0 012.286-2.286h2.286V2.857A2.866 2.866 0 017.428 0h1.143a2.866 2.866 0 012.857 2.857v1.714h6.857V2.857A2.866 2.866 0 0121.142 0h1.143a2.866 2.866 0 012.857 2.857v1.714h2.286a2.302 2.302 0 012.286 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CalendarO);
var _default = ForwardRef;
exports["default"] = _default;