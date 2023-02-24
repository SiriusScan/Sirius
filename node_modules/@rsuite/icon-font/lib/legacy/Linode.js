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

function Linode(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.893 27.411L9.5 31.232l-.607-4.214-3.857-3.804zm4.036 4.035l4.893-3.893-.196-4.375-5.357 3.839zM4.375 20.054l4.054 3.804-.857-5.839-4.375-3.643zm4.464 4l5.661-3.821-.25-5.786-6.286 3.571zm6.215.196l1.696 1.429-.036-4.268L14.875 20c0 .143.071.393-.071.5l-1.393.929 1.518 1.25c.179.143.125 1.357.125 1.571zM2.464 10.821l4.571 3.571-1.214-8.304L.839 2.999zm18.482 11.84l.268-4.179-4.107 2.929.036 4.286zm-13.5-8.125l6.661-3.464-.339-7.875-7.554 2.911zm15.233 6.518l.357-4.161L19 14.357l-.036 1.875 2.571 1.696c.054.036.089.107.071.161l-.125 2.125zm3.41-2.483l.536-3.964-3.196 2.286-.357 4.071zm-3.357 2.983l-1.268-.875-.143 2.089a.163.163 0 01-.071.143l-4.179 3.339a.213.213 0 01-.25 0l-1.75-1.482.125 2.875a.163.163 0 01-.071.143l-5.232 4.179c-.036.018-.071.036-.107.036-.054-.018-.107-.018-.143-.054l-4.071-4.321c-.089-.089-.964-4.5-1.054-4.946-.018-.071.036-.161.089-.196l1.089-.661C5.482 21.627 4.035 20.359 4 20.18l-1.286-6.268c-.018-.071.018-.161.107-.214l1.679-.804c-.286-.214-2.357-1.714-2.411-1.929L.375 2.644A.205.205 0 01.5 2.412L8.232.001c.036 0 .089 0 .143.018l5.661 2.732c.054.036.107.107.107.161l.357 8.268a.198.198 0 01-.107.179l-2.107 1.089 2.25 1.518c.054.018.089.089.089.143l.089 2.196 2.161-1.321a.191.191 0 01.196 0l1.5 1 .054-1.964c0-.054.036-.125.089-.161l3.679-2.25c.071-.036.143-.036.196 0l4.375 2.411a.317.317 0 01.089.125c.036.125-.554 4.143-.607 4.554a.151.151 0 01-.071.125l-3.411 2.732a.186.186 0 01-.232 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Linode);
var _default = ForwardRef;
exports["default"] = _default;