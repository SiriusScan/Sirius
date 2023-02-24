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

function UserAnalysis(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14.576 13.035c0 3.234-2.613 5.856-5.835 5.856s-5.835-2.622-5.835-5.856 2.613-5.856 5.835-5.856 5.835 2.622 5.835 5.856zM8.741 20.791C3.914 20.791-.002 25.81-.002 32h17.486c0-6.19-3.913-11.209-8.743-11.209zM18.277 21.026h-1.991l-1.41-2.149h2.13l1.527-3.051h3.726l2.923-6.021 1.865.965-3.502 7.205h-3.744zM25.129 18.096h2.286v9.079h-2.286v-9.079zM21.129 21.541h2.286v5.632h-2.286v-5.632zM17.129 24.359h2.286v2.816z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M24 0H7.397c-.553 0-1.022.194-1.41.583S5.404 1.442 5.404 2v2.535h2.658V2.668h15.925v5.323h5.344v21.346h-8.773V32h9.435c.553 0 1.024-.194 1.413-.585.386-.386.581-.859.581-1.415l-.002-22.011h.018l-.018-.018-5.287-5.305L24.001.001z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserAnalysis);
var _default = ForwardRef;
exports["default"] = _default;