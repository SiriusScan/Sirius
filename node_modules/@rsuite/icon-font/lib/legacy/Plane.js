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

function Plane(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 26 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M24.571 2.857c1.143 1.143 0 4-1.714 5.714l-2.875 2.875 2.857 12.429a.586.586 0 01-.214.589l-2.286 1.714a.55.55 0 01-.339.107c-.036 0-.071 0-.125-.018a.51.51 0 01-.375-.286l-4.982-9.071-4.625 4.625.946 3.464a.584.584 0 01-.143.554l-1.714 1.714a.597.597 0 01-.411.161h-.036a.579.579 0 01-.429-.232l-3.375-4.5-4.5-3.375c-.143-.089-.214-.25-.232-.411s.054-.321.161-.446l1.714-1.732a.597.597 0 01.411-.161c.054 0 .107 0 .143.018l3.464.946 4.625-4.625-9.071-4.982a.627.627 0 01-.304-.429.613.613 0 01.161-.482l2.286-2.286c.143-.125.357-.196.536-.143L16 7.427l2.857-2.857c1.714-1.714 4.571-2.857 5.714-1.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Plane);
var _default = ForwardRef;
exports["default"] = _default;