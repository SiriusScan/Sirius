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

function RelatedMap(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.409 8.512l.09.004a.5.5 0 01.429.562 8.003 8.003 0 01-7.349 6.901.5.5 0 11-.071-.997 7.002 7.002 0 006.429-6.037.5.5 0 01.385-.421l.087-.012zM7.428.02a.5.5 0 01.071.997 7.003 7.003 0 00-6.428 5.985.5.5 0 11-.99-.142A8.004 8.004 0 017.428.018zm4.956 8.673l.089.016a.5.5 0 01.35.614 5.005 5.005 0 01-4.244 3.644.5.5 0 01-.115-.993 4.003 4.003 0 003.394-2.914.5.5 0 01.438-.366h.088zM7.291 3.527a.5.5 0 01-.35.614 4.005 4.005 0 00-2.918 3.426.5.5 0 11-.994-.106 5.004 5.004 0 013.648-4.284.5.5 0 01.614.35zM8 9a1 1 0 100-2 1 1 0 000 2zm0 1a2 2 0 11-.001-3.999A2 2 0 018 10zM11 3a1 1 0 11-2 0 1 1 0 012 0zM6 14a1 1 0 11-2 0 1 1 0 012 0zM15 6a1 1 0 11-2 0 1 1 0 012 0zM3 10a1 1 0 11-2 0 1 1 0 012 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(RelatedMap);
var _default = ForwardRef;
exports["default"] = _default;