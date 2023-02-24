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

function Rocket(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.714 8a1.715 1.715 0 10-3.43.002A1.715 1.715 0 0025.714 8zm4-5.143c0 5.929-1.643 9.875-5.875 14.125a63.525 63.525 0 01-3.482 3.143L20 26.893a.65.65 0 01-.286.464l-6.857 4a.52.52 0 01-.286.071.63.63 0 01-.411-.161l-1.143-1.143c-.143-.161-.196-.375-.143-.571l1.518-4.929-5.018-5.018-4.929 1.518c-.054.018-.107.018-.161.018a.597.597 0 01-.411-.161L.73 19.838a.597.597 0 01-.089-.696l4-6.857a.652.652 0 01.464-.286l6.768-.357a63.12 63.12 0 013.143-3.482c4.464-4.446 7.875-5.875 14.089-5.875.321 0 .607.25.607.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Rocket);
var _default = ForwardRef;
exports["default"] = _default;