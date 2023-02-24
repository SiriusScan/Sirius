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

function SmileO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.25 19.196C19.357 22.071 16.732 24 13.714 24s-5.643-1.929-6.536-4.804c-.196-.607.143-1.232.75-1.429.589-.196 1.232.143 1.429.75a4.543 4.543 0 004.357 3.196c2 0 3.768-1.286 4.357-3.196a1.15 1.15 0 011.446-.75c.589.196.929.821.732 1.429zm-8.821-7.767c0 1.268-1.018 2.286-2.286 2.286s-2.286-1.018-2.286-2.286 1.018-2.286 2.286-2.286 2.286 1.018 2.286 2.286zm9.142 0c0 1.268-1.018 2.286-2.286 2.286s-2.286-1.018-2.286-2.286 1.018-2.286 2.286-2.286 2.286 1.018 2.286 2.286zM25.143 16c0-6.304-5.125-11.429-11.429-11.429S2.285 9.696 2.285 16 7.41 27.429 13.714 27.429 25.143 22.304 25.143 16zm2.286 0c0 7.571-6.143 13.714-13.714 13.714S.001 23.571.001 16 6.144 2.286 13.715 2.286 27.429 8.429 27.429 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SmileO);
var _default = ForwardRef;
exports["default"] = _default;