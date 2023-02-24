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

function AppSelect(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.5 12a.5.5 0 01.492.41l.008.09V14c0 .932-.933 1.907-1.867 1.994L14 16h-1.5a.5.5 0 01-.09-.992L12.5 15H14c.394 0 .918-.497.991-.907L15 14v-1.5a.5.5 0 01.5-.5zm-6 3a.5.5 0 01.09.992L9.5 16h-3a.5.5 0 01-.09-.992L6.5 15h3zm-9-3a.5.5 0 01.492.41L1 12.5V14c0 .394.497.918.907.991L2 15h1.5a.5.5 0 01.09.992L3.5 16H2c-.932 0-1.907-.933-1.994-1.867L0 14v-1.5a.5.5 0 01.5-.5zM14 7c.932 0 1.907.933 1.994 1.867L16 9v1.5a.5.5 0 01-.992.09L15 10.5V9c0-.394-.497-.918-.907-.991L14 8h-1.5a.5.5 0 01-.09-.992L12.5 7H14zM.5 6a.5.5 0 01.492.41L1 6.5v3a.5.5 0 01-.992.09L0 9.5v-3A.5.5 0 01.5 6zm8-1a.5.5 0 01.492.41L9 5.5V6c0 .394.497.918.907.991L10 7h.5a.5.5 0 01.09.992L10.5 8H10c-.932 0-1.907-.933-1.994-1.867L8 6v-.5a.5.5 0 01.5-.5zM7 0c.932 0 1.907.933 1.994 1.867L9 2v1.5a.5.5 0 01-.992.09L8 3.5V2c0-.394-.497-.918-.907-.991L7 1H5.5a.5.5 0 01-.09-.992L5.5 0H7zM3.5 0a.5.5 0 01.09.992L3.5 1H2c-.394 0-.918.497-.991.907L1 2v1.5a.5.5 0 01-.992.09L0 3.5V2C0 1.068.933.093 1.867.006L2 0h1.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 2a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h3zm0 1H3v3h3V3zm0 6a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3a1 1 0 011-1h3zm0 1H3v3h3v-3zm7-1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3a1 1 0 011-1h3zm0 1h-3v3h3v-3zm2-10a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V1a1 1 0 011-1h3zm0 1h-3v3h3V1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(AppSelect);
var _default = ForwardRef;
exports["default"] = _default;