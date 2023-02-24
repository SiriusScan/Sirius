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

function EnvelopeSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.286 2.286a5.145 5.145 0 015.143 5.143v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143zm.571 18.857v-7.786a5.44 5.44 0 01-1.143.982c-1.679 1.107-3.411 2.143-5.071 3.286-.839.589-1.875 1.232-2.929 1.232-1.054 0-2.089-.643-2.929-1.232-1.661-1.143-3.411-2.161-5.071-3.304-.411-.268-.732-.661-1.143-.964v7.786c0 .946.768 1.714 1.714 1.714h14.857c.946 0 1.714-.768 1.714-1.714zm0-10.232c0-.964-.714-1.768-1.714-1.768H6.286c-.946 0-1.714.768-1.714 1.714 0 .964 1 2.018 1.75 2.518 1.571 1.054 3.196 2.036 4.768 3.071.679.446 1.804 1.268 2.625 1.268s1.946-.821 2.625-1.268c1.589-1.036 3.179-2.054 4.768-3.107.696-.464 1.75-1.536 1.75-2.429z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(EnvelopeSquare);
var _default = ForwardRef;
exports["default"] = _default;