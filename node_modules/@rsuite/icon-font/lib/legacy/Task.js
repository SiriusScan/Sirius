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

function Task(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 14 14",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.688 1.75h7.875a.438.438 0 110 .876H5.688a.438.438 0 110-.876zM5.688 12.25h7.875a.438.438 0 110 .876H5.688a.438.438 0 110-.876zM5.688 7h7.875a.438.438 0 110 .876H5.688a.438.438 0 110-.876zM.875 6.125v1.75h1.75v-1.75H.875zm0-.875h1.75c.483 0 .875.392.875.875v1.75a.875.875 0 01-.875.875H.875A.875.875 0 010 7.875v-1.75c0-.483.392-.875.875-.875zM3.581.183a.437.437 0 11.712.508L2.105 3.754a.438.438 0 01-.663.058L.119 2.51a.438.438 0 11.614-.624l.958.942L3.581.182zM.875 11.375v1.75h1.75v-1.75H.875zm0-.875h1.75c.483 0 .875.392.875.875v1.75a.875.875 0 01-.875.875H.875A.875.875 0 010 13.125v-1.75c0-.483.392-.875.875-.875z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Task);
var _default = ForwardRef;
exports["default"] = _default;