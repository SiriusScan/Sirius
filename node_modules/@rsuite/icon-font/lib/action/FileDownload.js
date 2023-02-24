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

function FileDownload(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.586 0a1 1 0 01.608.206l.099.087L14 4a1 1 0 01-1 1H9.5a.5.5 0 01-.5-.5V1H3a1 1 0 00-.993.883L2 2v12a1 1 0 00.883.993L3 15h9a1 1 0 00.993-.883L13 14V7.5a.5.5 0 01.992-.09L14 7.5V14a2.001 2.001 0 01-1.851 1.995L12 16H3a2.001 2.001 0 01-1.995-1.851L1 14V2C1 .946 1.816.082 2.851.005L3 0h6.586zM10 1.415V4h2.585L10 1.415z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.5 6a.5.5 0 01.5.5v3.792l1.646-1.646a.5.5 0 01.707.707l-2.512 2.512a.4.4 0 01-.039.033l.051-.045a.471.471 0 01-.122.089l-.024.012a.39.39 0 00-.02.009l-.013.005-.018.006-.029.009a.174.174 0 01-.022.005l-.033.006-.052.005h-.041a.436.436 0 01-.052-.005l.072.005a.52.52 0 01-.105-.011l-.022-.005-.029-.009-.018-.006-.013-.005a.39.39 0 01-.02-.009l-.024-.012a.397.397 0 01-.07-.044.31.31 0 01-.039-.033l-.012-.012-2.5-2.5a.5.5 0 01.707-.707L7 10.293V6.5a.5.5 0 01.5-.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FileDownload);
var _default = ForwardRef;
exports["default"] = _default;