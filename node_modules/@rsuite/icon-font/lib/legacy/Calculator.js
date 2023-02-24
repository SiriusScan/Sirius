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

function Calculator(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 27.429c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm6.857 0c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm-6.857-6.858c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm13.714 6.858c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm-6.857-6.858c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm-6.857-6.857c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286S3.303 16 4.571 16s2.286-1.018 2.286-2.286zm13.714 6.857c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286 1.018 2.286 2.286 2.286 2.286-1.018 2.286-2.286zm-6.857-6.857c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286S10.16 16 11.428 16s2.286-1.018 2.286-2.286zm13.715 13.715v-6.857a2.302 2.302 0 00-2.286-2.286 2.302 2.302 0 00-2.286 2.286v6.857a2.302 2.302 0 002.286 2.286 2.302 2.302 0 002.286-2.286zm-6.858-13.715c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286S17.017 16 18.285 16s2.286-1.018 2.286-2.286zM27.429 8V3.429c0-.625-.518-1.143-1.143-1.143H3.429c-.625 0-1.143.518-1.143 1.143V8c0 .625.518 1.143 1.143 1.143h22.857c.625 0 1.143-.518 1.143-1.143zm0 5.714c0-1.268-1.018-2.286-2.286-2.286s-2.286 1.018-2.286 2.286S23.875 16 25.143 16s2.286-1.018 2.286-2.286zm2.285-11.428v27.429a2.302 2.302 0 01-2.286 2.286H2.285a2.302 2.302 0 01-2.286-2.286V2.286A2.302 2.302 0 012.285 0h25.143a2.302 2.302 0 012.286 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Calculator);
var _default = ForwardRef;
exports["default"] = _default;