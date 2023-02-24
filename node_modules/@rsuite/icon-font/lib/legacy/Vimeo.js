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

function Vimeo(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M30.518 9.25c-.125 2.821-2.107 6.696-5.929 11.625-3.964 5.125-7.286 7.696-10.036 7.696-1.696 0-3.125-1.571-4.286-4.696-.786-2.857-1.571-5.732-2.357-8.607-.857-3.125-1.804-4.679-2.804-4.679-.214 0-.964.446-2.268 1.357l-1.375-1.75c1.429-1.268 2.839-2.554 4.25-3.786 1.893-1.679 3.339-2.518 4.304-2.607 2.268-.214 3.643 1.321 4.179 4.625.554 3.571.964 5.804 1.179 6.661.661 2.964 1.357 4.446 2.143 4.446.607 0 1.518-.946 2.75-2.875 1.214-1.929 1.857-3.393 1.946-4.393.161-1.661-.482-2.482-1.946-2.482-.696 0-1.411.161-2.161.464 1.429-4.679 4.161-6.946 8.196-6.821 2.982.089 4.393 2.036 4.214 5.821z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Vimeo);
var _default = ForwardRef;
exports["default"] = _default;