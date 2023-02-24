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

function Flag(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 33 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.714 4.571c0 .821-.446 1.554-1.143 1.964v22.607a.587.587 0 01-.571.571H2.857a.587.587 0 01-.571-.571V6.535a2.282 2.282 0 01-1.143-1.964c0-1.268 1.018-2.286 2.286-2.286s2.286 1.018 2.286 2.286zM32 5.714v13.625c0 .661-.411.911-.929 1.179-2.018 1.089-4.25 2.071-6.589 2.071-3.286 0-4.857-2.5-8.75-2.5-2.839 0-5.821 1.286-8.286 2.607a1.171 1.171 0 01-.589.161 1.151 1.151 0 01-1.143-1.143V8.464c0-.429.214-.732.554-.982.429-.286.946-.536 1.411-.768 2.25-1.143 4.982-2.143 7.518-2.143 2.804 0 5 .929 7.482 2.089.5.25 1.018.339 1.571.339 2.804 0 5.821-2.429 6.607-2.429.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Flag);
var _default = ForwardRef;
exports["default"] = _default;