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

function Ios(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M24.738 17.001c-.039-4.053 3.303-5.995 3.454-6.091-1.879-2.75-4.807-3.127-5.851-3.17-2.491-.251-4.862 1.467-6.128 1.467-1.262 0-3.214-1.431-5.28-1.392-2.715.041-5.218 1.579-6.617 4.011-2.823 4.896-.722 12.151 2.027 16.121 1.344 1.943 2.946 4.128 5.049 4.05 2.025-.08 2.791-1.312 5.241-1.312s3.138 1.312 5.282 1.271c2.181-.039 3.561-1.982 4.896-3.931 1.543-2.256 2.178-4.437 2.215-4.549-.048-.023-4.251-1.632-4.293-6.471l.005-.005zm-4.027-11.89c1.115-1.355 1.87-3.234 1.664-5.111-1.609.066-3.559 1.072-4.713 2.423-1.035 1.2-1.943 3.113-1.701 4.951 1.797.142 3.632-.91 4.75-2.263z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Ios);
var _default = ForwardRef;
exports["default"] = _default;