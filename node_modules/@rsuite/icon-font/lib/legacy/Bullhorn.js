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

function Bullhorn(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.714 11.429c1.268 0 2.286 1.018 2.286 2.286s-1.018 2.286-2.286 2.286v6.857a2.302 2.302 0 01-2.286 2.286c-3.179-2.643-8.304-6.268-14.5-6.786-2.125.714-2.857 3.196-1.464 4.625-1.25 2.054.357 3.5 2.25 4.982-1.107 2.179-5.714 2.214-7.357.696-1.036-3.179-2.571-6.357-1.321-10.375H2.857A2.866 2.866 0 010 15.429V12a2.866 2.866 0 012.857-2.857h8.571c6.857 0 12.571-4 16-6.857a2.302 2.302 0 012.286 2.286v6.857zm-2.285 10.785V5.178c-4.661 3.571-9.179 5.625-13.714 6.125v4.821c4.536.5 9.054 2.518 13.714 6.089z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Bullhorn);
var _default = ForwardRef;
exports["default"] = _default;