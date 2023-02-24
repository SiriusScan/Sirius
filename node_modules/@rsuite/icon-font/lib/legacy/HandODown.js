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

function HandODown(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 17.143c0-3.554-2.286-6.589-2.286-9.714v-.571H11.428v.571c0 1.893-1.607 3.161-2.911 4.304-.821.732-1.643 1.411-2.589 2-.393.25-.804.464-1.214.679s-2.429 1.107-2.429 1.589c0 1.518.571 2.857 2.286 2.857 2.286 0 3.446-1.714 4.571-1.714V27.43c0 1.196 1.071 2.286 2.286 2.286 1.232 0 2.286-1.054 2.286-2.286v-5.911c.464.357 1.25.625 1.839.625.839 0 1.554-.339 2.125-.946.375.214.804.321 1.232.321.821 0 1.839-.411 2.25-1.161.321.054.661.071 1 .071 2.107 0 2.982-1.304 2.982-3.286zM22.857 3.429c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143.518 1.143 1.143 1.143 1.143-.518 1.143-1.143zm4.572 13.642c0 3.286-1.857 5.679-5.268 5.661l-.089-.018c-.893.714-2.036 1.089-3.179 1.089-.25 0-.518-.018-.768-.054A5.92 5.92 0 0116 24.41v3.018c0 2.5-2.089 4.571-4.589 4.571-2.464 0-4.554-2.107-4.554-4.571v-6.679c-.696.286-1.536.393-2.286.393-3 0-4.571-2.304-4.571-5.143 0-2.393 3.054-3.161 4.714-4.196.839-.536 1.571-1.143 2.304-1.786.589-.518 2.125-1.732 2.125-2.589V2.285a2.279 2.279 0 012.286-2.286h11.429a2.279 2.279 0 012.286 2.286v5.143c0 1.125.661 2.893 1.054 3.982.661 1.821 1.232 3.696 1.232 5.661z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(HandODown);
var _default = ForwardRef;
exports["default"] = _default;