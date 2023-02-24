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

function Charts(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M2 30V0H0v32h32v-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.798 18.222a.995.995 0 01-.706-.293l-5.106-5.104-2.834 2.832a1 1 0 01-1.415 0l-4.343-4.343a1 1 0 111.415-1.415l3.634 3.634 2.837-2.834a1 1 0 011.415 0l5.104 5.106 9.246-9.248a1 1 0 111.415 1.415l-9.954 9.959c-.187.185-.441.29-.706.29z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.395 28V15.76s1.024-.391 1.415 0l3.634 3.634 2.837-2.832a1 1 0 011.415 0l5.102 5.106 9.246-9.248c.391-.391 1.415 0 1.415 0v15.579H4.396z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Charts);
var _default = ForwardRef;
exports["default"] = _default;