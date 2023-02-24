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

function Spotify(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.125 21.607c0-.5-.196-.696-.536-.911-2.304-1.375-4.982-2.054-7.982-2.054-1.75 0-3.429.232-5.125.607-.411.089-.75.357-.75.929 0 .446.339.875.875.875.161 0 .446-.089.661-.143 1.393-.286 2.857-.482 4.339-.482 2.625 0 5.107.643 7.089 1.839.214.125.357.196.589.196a.842.842 0 00.839-.857zm1.714-3.839c0-.482-.179-.821-.625-1.089-2.732-1.625-6.196-2.518-9.786-2.518-2.304 0-3.875.321-5.411.75-.571.161-.857.554-.857 1.143s.482 1.071 1.071 1.071c.25 0 .393-.071.661-.143 1.25-.339 2.75-.589 4.482-.589 3.393 0 6.482.893 8.714 2.214.196.107.393.232.679.232.607 0 1.071-.482 1.071-1.071zm1.929-4.429c0-.661-.286-1-.714-1.25-3.089-1.804-7.321-2.643-11.357-2.643-2.375 0-4.554.268-6.5.839-.5.143-.964.571-.964 1.321 0 .732.554 1.304 1.286 1.304.268 0 .518-.089.714-.143 1.732-.482 3.607-.661 5.482-.661 3.714 0 7.571.821 10.054 2.304.25.143.429.214.714.214a1.28 1.28 0 001.286-1.286zM27.429 16c0 7.571-6.143 13.714-13.714 13.714S.001 23.571.001 16 6.144 2.286 13.715 2.286 27.429 8.429 27.429 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Spotify);
var _default = ForwardRef;
exports["default"] = _default;