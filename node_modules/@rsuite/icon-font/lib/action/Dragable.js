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

function Dragable(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.5 7a.5.5 0 01.5.5v6.632l2.004-1.965a.592.592 0 01.744-.066l.081.066a.563.563 0 01.068.729l-.068.079-2.917 2.859a.593.593 0 01-.264.149L11.55 16h-.099a.588.588 0 01-.363-.165l-2.917-2.859c-.228-.223-.228-.585 0-.809s.597-.223.825 0L11 14.132V7.5a.5.5 0 01.5-.5zM4.55 0a.588.588 0 01.363.165L7.83 3.024c.228.223.228.585 0 .809s-.597.223-.825 0L5.001 1.868V8.5a.5.5 0 01-1 0V1.866L1.997 3.833a.592.592 0 01-.744.066l-.081-.066a.563.563 0 01-.068-.729l.067-.079L4.088.166a.585.585 0 01.363-.165h.099z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Dragable);
var _default = ForwardRef;
exports["default"] = _default;