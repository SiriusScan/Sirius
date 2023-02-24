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

function Cubes(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 39 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 29.143l6.857-3.429v-5.607l-6.857 2.929v6.107zm-1.143-8.107l7.214-3.089-7.214-3.089-7.214 3.089zm19.428 8.107l6.857-3.429v-5.607l-6.857 2.929v6.107zm-1.143-8.107l7.214-3.089-7.214-3.089-7.214 3.089zm-8-5.232l6.857-2.946v-4.75l-6.857 2.929v4.768zm-1.142-6.768l7.875-3.375-7.875-3.375-7.875 3.375zm19.428 9.25v7.429c0 .857-.482 1.661-1.268 2.036l-8 4c-.321.179-.661.25-1.018.25s-.696-.071-1.018-.25l-8-4a.295.295 0 01-.125-.071.276.276 0 01-.125.071l-8 4c-.321.179-.661.25-1.018.25s-.696-.071-1.018-.25l-8-4a2.253 2.253 0 01-1.268-2.036v-7.429c0-.911.554-1.732 1.393-2.107l7.75-3.321V5.715c0-.911.554-1.732 1.393-2.107l8-3.429c.286-.125.589-.179.893-.179s.607.054.893.179l8 3.429c.839.375 1.393 1.196 1.393 2.107v7.143l7.75 3.321a2.294 2.294 0 011.393 2.107z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Cubes);
var _default = ForwardRef;
exports["default"] = _default;