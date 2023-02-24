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

function ThumbsUp(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 29 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.571 24c0-.625-.518-1.143-1.143-1.143A1.14 1.14 0 002.285 24c0 .643.5 1.143 1.143 1.143.625 0 1.143-.5 1.143-1.143zm2.858-9.143v11.429c0 .625-.518 1.143-1.143 1.143H1.143A1.151 1.151 0 010 26.286V14.857c0-.625.518-1.143 1.143-1.143h5.143c.625 0 1.143.518 1.143 1.143zm21.142 0c0 .946-.375 1.964-.982 2.661.196.571.268 1.107.268 1.357a3.768 3.768 0 01-.768 2.446 3.783 3.783 0 010 2.089c-.179.661-.518 1.25-.964 1.679.107 1.339-.196 2.429-.875 3.232-.768.911-1.946 1.375-3.518 1.393h-2.304c-2.554 0-4.964-.839-6.893-1.5-1.125-.393-2.196-.768-2.821-.786-.607-.018-1.143-.518-1.143-1.143V14.839c0-.589.5-1.089 1.089-1.143.661-.054 2.375-2.179 3.161-3.214.643-.821 1.25-1.589 1.804-2.143.696-.696.893-1.768 1.107-2.804.196-1.054.411-2.161 1.179-2.911.214-.214.5-.339.804-.339 4 0 4 3.196 4 4.571 0 1.464-.518 2.5-1 3.429-.196.393-.375.571-.518 1.143h4.946c1.857 0 3.429 1.571 3.429 3.429z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ThumbsUp);
var _default = ForwardRef;
exports["default"] = _default;