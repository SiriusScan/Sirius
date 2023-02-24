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

function Ship(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M32.339 27.768a1.132 1.132 0 011.607 0l2.286 2.286-1.607 1.607-1.482-1.482-1.482 1.482c-.214.232-.518.339-.804.339s-.589-.107-.804-.339l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0L24 30.179l-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0L.341 29.375l1.607-1.607L3.43 29.25l1.482-1.482a1.132 1.132 0 011.607 0l1.482 1.482 1.482-1.482a1.132 1.132 0 011.607 0l1.482 1.482 1.482-1.482a1.132 1.132 0 011.607 0l1.482 1.482 1.482-1.482a1.132 1.132 0 011.607 0l1.482 1.482 1.482-1.482a1.132 1.132 0 011.607 0l1.482 1.482 1.482-1.482a1.132 1.132 0 011.607 0l1.482 1.482zm-28.107-.679a1.132 1.132 0 01-1.607 0L.339 24.803l1.607-1.607 1.482 1.464 1.482-1.464a1.132 1.132 0 011.607 0l1.482 1.464 1.143-1.143v-5.232l-3.75-5.607a1.163 1.163 0 01.589-1.732L9.142 9.91V4.571h2.286V2.285h4.571V-.001h4.571v2.286h4.571v2.286h2.286V9.91l3.161 1.036c.714.25 1 1.107.589 1.732l-3.75 5.607v5.232l.339-.321a1.132 1.132 0 011.607 0l1.482 1.464 1.482-1.464a1.132 1.132 0 011.607 0l2.286 2.286-1.607 1.607-1.482-1.482-1.482 1.482c-.214.232-.518.339-.804.339s-.589-.107-.804-.339l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482-1.482 1.482a1.132 1.132 0 01-1.607 0l-1.482-1.482zm7.197-20.232v2.286l6.857-2.286 6.857 2.286V6.857h-2.286V4.571h-9.143v2.286h-2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Ship);
var _default = ForwardRef;
exports["default"] = _default;