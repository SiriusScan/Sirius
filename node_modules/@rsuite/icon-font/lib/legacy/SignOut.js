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

function SignOut(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 28 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 25.714c0 .5.232 1.714-.571 1.714H5.144a5.145 5.145 0 01-5.143-5.143V9.714a5.145 5.145 0 015.143-5.143h5.714c.304 0 .571.268.571.571 0 .5.232 1.714-.571 1.714H5.144a2.866 2.866 0 00-2.857 2.857v12.571a2.866 2.866 0 002.857 2.857h5.143c.446 0 1.143-.089 1.143.571zM28 16c0 .304-.125.589-.339.804l-9.714 9.714c-.214.214-.5.339-.804.339A1.151 1.151 0 0116 25.714v-5.143H8a1.151 1.151 0 01-1.143-1.143v-6.857c0-.625.518-1.143 1.143-1.143h8V6.285c0-.625.518-1.143 1.143-1.143.304 0 .589.125.804.339l9.714 9.714c.214.214.339.5.339.804z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SignOut);
var _default = ForwardRef;
exports["default"] = _default;