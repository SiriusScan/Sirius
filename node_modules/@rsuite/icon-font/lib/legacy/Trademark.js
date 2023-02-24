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

function Trademark(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 35 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.304 9.714v2.089a.572.572 0 01-.571.554H9.412v14.5a.56.56 0 01-.554.571H6.447a.564.564 0 01-.571-.571v-14.5H.572a.56.56 0 01-.571-.554V9.714c0-.321.25-.571.571-.571h14.161c.304 0 .571.25.571.571zm18.535-.053l1.375 17.161a.549.549 0 01-.143.429.582.582 0 01-.411.179h-2.393a.563.563 0 01-.554-.518l-.821-10.5-3.375 7.589a.545.545 0 01-.518.339h-2.143a.582.582 0 01-.518-.339l-3.357-7.625-.804 10.536a.563.563 0 01-.554.518h-2.411a.578.578 0 01-.411-.179.641.641 0 01-.161-.429l1.393-17.161a.563.563 0 01.554-.518h2.536c.232 0 .429.143.518.339l3.929 9.286c.125.286.25.607.357.911.125-.304.232-.625.357-.911l3.946-9.286a.573.573 0 01.518-.339h2.518c.304 0 .554.232.571.518z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Trademark);
var _default = ForwardRef;
exports["default"] = _default;