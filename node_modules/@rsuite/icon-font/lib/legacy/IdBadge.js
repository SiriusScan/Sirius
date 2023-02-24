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

function IdBadge(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 22.464c0 1.536-1.018 2.679-2.286 2.679H6.857c-1.268 0-2.286-1.143-2.286-2.679 0-2.786.696-5.875 3.5-5.875.875.821 2.054 1.339 3.357 1.339s2.482-.518 3.357-1.339c2.804 0 3.5 3.089 3.5 5.875zm-2.75-9.268c0 2.25-1.839 4.054-4.107 4.054s-4.107-1.804-4.107-4.054c0-2.232 1.839-4.054 4.107-4.054s4.107 1.821 4.107 4.054zm5.035 15.947V4.572H2.285v24.571c0 .304.268.571.571.571h17.143a.587.587 0 00.571-.571zm2.286-26.286v26.286A2.866 2.866 0 0120 32H2.857A2.866 2.866 0 010 29.143V2.857A2.866 2.866 0 012.857 0h6.286v1.714c0 .321.25.571.571.571h3.429c.321 0 .571-.25.571-.571V0H20a2.866 2.866 0 012.857 2.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(IdBadge);
var _default = ForwardRef;
exports["default"] = _default;