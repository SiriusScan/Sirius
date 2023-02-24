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

function Split(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.146 11.146a.5.5 0 01.638-.058l.069.058 2 2a.5.5 0 01.058.638l-.058.069-2 2a.5.5 0 01-.765-.638l.058-.069 1.647-1.646-1.647-1.646a.5.5 0 01-.058-.638l.058-.069zm0-11a.5.5 0 01.638-.058l.069.058 2 2a.5.5 0 01.058.638l-.058.069-2 2a.5.5 0 01-.765-.638l.058-.069L14.793 2.5 13.146.854a.5.5 0 01-.058-.638l.058-.069z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.84 7c.553 0 1.088-.183 1.523-.518l.158-.132 3.784-3.44a3.498 3.498 0 012.137-.903L12.659 2h1.84a.5.5 0 01.09.992l-.09.008h-1.84c-.553 0-1.088.183-1.523.518l-.158.132-3.784 3.44a3.506 3.506 0 01-.851.571c.411.249.784.568 1.101.944l.155.195 2.1 2.8a3.5 3.5 0 002.581 1.393l.219.007h2a.5.5 0 01.09.992l-.09.008h-2a4.5 4.5 0 01-3.445-1.605l-.155-.195-2.1-2.8a3.5 3.5 0 00-2.581-1.393L3.999 8h-3.5a.5.5 0 01-.09-.992L.499 7h4.34z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Split);
var _default = ForwardRef;
exports["default"] = _default;