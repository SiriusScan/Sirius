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

function PeopleBranch(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.5 5a1.5 1.5 0 11-1.401 2.036c-.739.136-1.247.678-1.752 1.687l-.536 1.136-.073.14h4.347A1.5 1.5 0 1113.086 11l-3.193-.001c.065.178.122.382.175.612l.157.722.011.045c.257 1.028.704 1.519 1.856 1.607a1.5 1.5 0 11-.01 1.001c-1.667-.113-2.455-.923-2.816-2.365l-.055-.233-.079-.378c-.164-.787-.266-.985-.564-1.008L8.501 11h-2a.5.5 0 010-1h1c.054 0 .172-.124.354-.465l.092-.182.507-1.076C9.12 6.944 9.89 6.17 11.078 6.025A1.5 1.5 0 0112.501 5zm1 9a.5.5 0 100 1 .5.5 0 000-1zm1-4a.5.5 0 100 1 .5.5 0 000-1zm-2-4a.5.5 0 100 1 .5.5 0 000-1zM7 0a3 3 0 110 6 3 3 0 010-6zm0 1a2 2 0 10-.001 3.999A2 2 0 007 1zM2 3a2 2 0 11.001 3.999A2 2 0 012 3zm0 1a1 1 0 100 2 1 1 0 000-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 5a.5.5 0 010 1C5.641 6 4.113 7.345 4.006 8.834L4 9v3.5a.5.5 0 00.41.492L4.5 13H8a.5.5 0 01.09.992L8 14H4.5a1.5 1.5 0 01-1.493-1.356L3 12.5V9c0-2.128 2.059-4 4-4zM2.474 7.342a.499.499 0 00-.632-.316C.681 7.413.064 8.365.005 9.774L0 10v2.5a.5.5 0 00.992.09L1 12.5V10c0-1.133.38-1.766 1.158-2.026a.499.499 0 00.316-.632z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PeopleBranch);
var _default = ForwardRef;
exports["default"] = _default;