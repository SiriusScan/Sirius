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

function YoutubePlay(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.696 20.143l8.643-4.464-8.643-4.518v8.982zM16 4.75c6.732 0 11.196.321 11.196.321.625.071 2 .071 3.214 1.357 0 0 .982.964 1.268 3.179.339 2.589.321 5.179.321 5.179v2.429s.018 2.589-.321 5.179c-.286 2.196-1.268 3.179-1.268 3.179-1.214 1.268-2.589 1.268-3.214 1.339 0 0-4.464.339-11.196.339-8.321-.071-10.875-.321-10.875-.321-.714-.125-2.321-.089-3.536-1.357 0 0-.982-.982-1.268-3.179C-.018 19.805 0 17.215 0 17.215v-2.429s-.018-2.589.321-5.179c.286-2.214 1.268-3.179 1.268-3.179 1.214-1.286 2.589-1.286 3.214-1.357 0 0 4.464-.321 11.196-.321z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(YoutubePlay);
var _default = ForwardRef;
exports["default"] = _default;