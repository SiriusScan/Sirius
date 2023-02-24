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

function Subway(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M19.429 0c4.411 0 8 2.554 8 5.714v16c0 3.089-3.411 5.589-7.696 5.696l3.804 3.607a.568.568 0 01-.393.982H4.287a.568.568 0 01-.393-.982l3.804-3.607C3.412 27.303.002 24.803.002 21.714v-16C.002 2.553 3.591 0 8.002 0h11.429zM5.143 23.429C6.714 23.429 8 22.143 8 20.572s-1.286-2.857-2.857-2.857-2.857 1.286-2.857 2.857 1.286 2.857 2.857 2.857zm7.428-9.715V4.571H2.857v9.143h9.714zm9.715 9.715c1.571 0 2.857-1.286 2.857-2.857s-1.286-2.857-2.857-2.857-2.857 1.286-2.857 2.857 1.286 2.857 2.857 2.857zm2.857-9.715V4.571H14.857v9.143h10.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Subway);
var _default = ForwardRef;
exports["default"] = _default;