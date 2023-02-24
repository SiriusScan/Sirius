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

function AdvancedAnalytics(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12 0c.123 0 .241.046.332.126l.063.067 3.5 4.5a.5.5 0 01.059.517l-.047.081-7.5 10.5a.5.5 0 01-.748.075l-.066-.075-2.465-3.451a.5.5 0 01.755-.649l.059.068L8 14.64l6.876-9.628L11.756 1H4.243l-3.12 4.012 2.412 3.377a.5.5 0 01-.048.639l-.068.059a.5.5 0 01-.639-.048l-.059-.068-2.628-3.68a.501.501 0 01-.038-.519l.05-.079 3.5-4.5a.502.502 0 01.303-.185L3.999 0h8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.5 4a.5.5 0 01.5.5v3a.5.5 0 01-1 0V5H7.5a.5.5 0 010-1h3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.646 4.646a.5.5 0 01.765.638l-.058.069-3.5 3.5a.5.5 0 01-.638.058l-.069-.058L5 7.706l-3.646 3.647a.5.5 0 01-.638.058l-.069-.058a.5.5 0 01-.058-.638l.058-.069 4-4a.5.5 0 01.638-.058l.069.058L6.5 7.793l3.146-3.147z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(AdvancedAnalytics);
var _default = ForwardRef;
exports["default"] = _default;