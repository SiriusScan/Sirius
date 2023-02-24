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

function Font(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.946 9.982L9.91 18.018c1.768.018 3.536.071 5.304.071.339 0 .679-.018 1.018-.036-.929-2.714-2.018-5.482-3.286-8.071zM0 29.714l.036-1.411c1.679-.518 3.5-.161 4.25-2.089l4.232-11 5-12.929h2.286c.071.125.143.25.196.375l3.661 8.571c1.339 3.161 2.571 6.357 3.929 9.5.804 1.857 1.429 3.768 2.321 5.589.125.286.375.821.625 1.018.589.464 2.232.571 3.071.893.054.339.107.679.107 1.018 0 .161-.018.304-.018.464-2.268 0-4.536-.286-6.804-.286-2.339 0-4.679.196-7.018.268 0-.464.018-.929.071-1.393l2.339-.5c.482-.107 1.429-.232 1.429-.893 0-.643-2.304-5.946-2.589-6.679l-8.036-.036c-.464 1.036-2.268 5.714-2.268 6.393 0 1.375 2.625 1.429 3.643 1.571.018.339.018.679.018 1.036 0 .161-.018.321-.036.482-2.071 0-4.161-.357-6.232-.357-.25 0-.607.107-.857.143-1.125.196-2.232.25-3.357.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Font);
var _default = ForwardRef;
exports["default"] = _default;