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

function Slideshare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.589 13.214c0 1.982-1.732 3.607-3.857 3.607s-3.857-1.625-3.857-3.607c0-2 1.732-3.607 3.857-3.607s3.857 1.607 3.857 3.607zm8.965 0c0 1.982-1.714 3.607-3.857 3.607-2.125 0-3.857-1.625-3.857-3.607 0-2 1.732-3.607 3.857-3.607 2.143 0 3.857 1.607 3.857 3.607zm4.017 3.215V4.518c0-2.054-.661-2.857-2.554-2.857H6.16c-1.982 0-2.536.679-2.536 2.857v12.018c4.232 2.214 7.857 1.821 9.839 1.75.839-.018 1.375.143 1.696.482.054.054.107.107.179.161.375.357.732.643 1.089.911.071-.982.625-1.607 2.107-1.554 2.018.089 5.732.482 10.036-1.857zm2.911-.09c-1.143 1.411-3.321 3.143-6.643 4.5 3.518 11.982-8.589 13.893-8.393 7.75 0 .107-.018-3.304-.018-5.839-.268-.054-.536-.125-.857-.196 0 2.554-.018 6.143-.018 6.036.196 6.143-11.911 4.232-8.393-7.75-3.321-1.357-5.5-3.089-6.643-4.5-.571-.857.054-1.768 1-1.107.125.089.268.179.393.268V3.108C1.91 1.394 3.196.001 4.785.001h22.446c1.589 0 2.875 1.393 2.875 3.107v12.393l.375-.268c.946-.661 1.571.25 1 1.107z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Slideshare);
var _default = ForwardRef;
exports["default"] = _default;