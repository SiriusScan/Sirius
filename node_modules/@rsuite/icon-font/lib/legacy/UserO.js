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

function UserO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M21.446 14c2.518.732 5.982 3.214 5.982 11.339 0 3.679-2.732 6.661-6.089 6.661H6.089C2.732 32 0 29.018 0 25.339 0 17.214 3.464 14.732 5.982 14a9.04 9.04 0 01-1.411-4.857C4.571 4.107 8.678 0 13.714 0s9.143 4.107 9.143 9.143A9.04 9.04 0 0121.446 14zM13.714 2.286c-3.786 0-6.857 3.071-6.857 6.857S9.928 16 13.714 16s6.857-3.071 6.857-6.857-3.071-6.857-6.857-6.857zm7.625 27.428c2.089 0 3.804-1.946 3.804-4.375 0-5.625-1.893-9.143-5.429-9.321-1.607 1.411-3.696 2.268-6 2.268s-4.393-.857-6-2.268c-3.536.179-5.429 3.696-5.429 9.321 0 2.429 1.714 4.375 3.804 4.375h15.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserO);
var _default = ForwardRef;
exports["default"] = _default;