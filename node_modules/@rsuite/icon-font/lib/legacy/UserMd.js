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

function UserMd(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 24c0 .625-.518 1.143-1.143 1.143S4.571 24.625 4.571 24s.518-1.143 1.143-1.143 1.143.518 1.143 1.143zm18.286 1.089c0 2.911-1.911 4.625-4.768 4.625H4.768C1.911 29.714 0 28 0 25.089 0 21.535.714 15.928 4.964 15c-.286.679-.393 1.411-.393 2.143v3.625A3.43 3.43 0 109.143 24a3.45 3.45 0 00-2.286-3.232v-3.625c0-.589.054-1.179.446-1.661 1.5 1.179 3.357 1.857 5.268 1.857s3.768-.679 5.268-1.857c.393.482.446 1.071.446 1.661v1.143a4.58 4.58 0 00-4.571 4.571v1.589a1.72 1.72 0 00-.571 1.268 1.715 1.715 0 003.428 0c0-.482-.214-.946-.571-1.268v-1.589c0-1.25 1.036-2.286 2.286-2.286s2.286 1.036 2.286 2.286v1.589a1.72 1.72 0 00-.571 1.268 1.715 1.715 0 003.428 0c0-.482-.214-.946-.571-1.268v-1.589a4.551 4.551 0 00-2.286-3.946c0-1.304.125-2.696-.393-3.911 4.25.929 4.964 6.536 4.964 10.089zM19.429 9.143c0 3.786-3.071 6.857-6.857 6.857s-6.857-3.071-6.857-6.857 3.071-6.857 6.857-6.857 6.857 3.071 6.857 6.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserMd);
var _default = ForwardRef;
exports["default"] = _default;