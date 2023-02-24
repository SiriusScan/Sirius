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

function Joomla(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M19.107 19.161l-2.857 2.857-2.696 2.714-.536.536a6.089 6.089 0 01-5.768 1.589A3.67 3.67 0 010 26.035a3.659 3.659 0 012.821-3.571A6.059 6.059 0 014.41 16.66l.214-.214L7.32 19.16l-.196.196c-.893.875-.875 2.304 0 3.196a2.253 2.253 0 003.179 0l.536-.536 2.696-2.714 2.875-2.857zM13.018 6.982l.214.214-2.714 2.714-.214-.214c-.875-.875-2.304-.875-3.179 0s-.875 2.321 0 3.196l6.089 6.089-2.696 2.714-2.875-2.857-2.696-2.714-.536-.536c-1.643-1.625-2.143-3.964-1.518-6.054A3.641 3.641 0 01.036 5.963a3.67 3.67 0 013.661-3.679 3.671 3.671 0 013.625 3.071 6.111 6.111 0 015.696 1.625zm14.411 19.054a3.67 3.67 0 01-3.661 3.679 3.68 3.68 0 01-3.607-2.946 6.08 6.08 0 01-6.089-1.5l-.196-.214 2.696-2.714.214.214c.875.875 2.304.875 3.179 0s.875-2.304 0-3.179l-6.107-6.107 2.714-2.714 5.571 5.571.518.536a6.055 6.055 0 011.607 5.75 3.66 3.66 0 013.161 3.625zm-.036-20.072c0 1.857-1.393 3.393-3.179 3.643a6.078 6.078 0 01-1.554 5.982l-.214.214-2.696-2.714.214-.214c.875-.875.875-2.304 0-3.179s-2.304-.875-3.179 0l-6.107 6.107-2.714-2.714 2.875-2.857 2.714-2.714.518-.536a6.082 6.082 0 016.018-1.536 3.678 3.678 0 013.643-3.161 3.67 3.67 0 013.661 3.679z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Joomla);
var _default = ForwardRef;
exports["default"] = _default;