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

function ReplyAll(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 19.321v1.25c0 .464-.286.875-.696 1.054a1.316 1.316 0 01-.446.089c-.304 0-.589-.107-.804-.339L.34 12.232a1.132 1.132 0 010-1.607l9.143-9.143a1.123 1.123 0 011.25-.25c.411.179.696.589.696 1.054v1.232L4.34 10.625a1.132 1.132 0 000 1.607zM32 20c0 3.714-2.804 9.179-2.929 9.411a.535.535 0 01-.5.304c-.054 0-.107 0-.161-.018a.594.594 0 01-.411-.607c.518-4.875-.089-8.089-1.893-10.089-1.518-1.696-3.982-2.607-7.821-2.911v4.482c0 .464-.286.875-.696 1.054a1.316 1.316 0 01-.446.089c-.304 0-.589-.107-.804-.339l-9.143-9.143a1.132 1.132 0 010-1.607l9.143-9.143a1.123 1.123 0 011.25-.25c.411.179.696.589.696 1.054v4.679c4.929.339 8.446 1.643 10.696 3.946 2.696 2.768 3.018 6.518 3.018 9.089z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ReplyAll);
var _default = ForwardRef;
exports["default"] = _default;