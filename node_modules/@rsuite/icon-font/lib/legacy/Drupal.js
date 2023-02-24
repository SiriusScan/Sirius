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

function Drupal(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M20.839 28.321c-.036-.125-.143-.304-.429-.089-.607.446-1.964 1-3.893 1s-2.839-.411-3.446-.875c-.089-.071-.054-.071-.232-.071-.196 0-.304.089-.464.214a.45.45 0 000 .643c1.321 1.214 3.536 1.107 5.161.964 1.643-.161 3.036-1.125 3.179-1.268.214-.214.161-.393.125-.518zm-.696-2.053c-.125-.304-.339-.839-.696-1.089-.357-.232-.875-.268-1.357-.268s-.75-.036-1.268.179-1.054.696-1.393 1-.393.536-.214.786c.179.232.375.089.875-.339.518-.411.857-.786 1.911-.786s1.232.393 1.446.786.232.446.446.339c.25-.125.375-.304.25-.607zm6.339-5.018c0-.929-.411-2.5-1.929-2.5-1.429 0-4.321 2.964-5.839 2.982-1.768.036-4.214-3.5-7.75-3.464-2.786.018-4.982 2.232-5.018 4.589-.018 1.321.411 2.304 1.321 2.929.607.411 1.161.661 2.964.661 3 0 6.804-3.714 8.554-3.661 1.393.054 3.554 3.464 4.643 3.536.857.071 1.304-.321 2.036-1.375.714-1.071 1.018-2.75 1.018-3.696zm.947-2.857c0 8-6.321 13.286-13.589 13.286-7.286 0-13.839-5.732-13.839-13.536 0-7.786 6.071-11.393 7.196-11.982 1.339-.714 2.304-1.089 3.821-2.304.75-.589 1.375-1.446 1.571-3.536 1.089 1.304 2.393 2.821 3.321 3.446 1.518 1 3.036 1.393 4.625 2.393.964.589 6.893 4.214 6.893 12.232z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Drupal);
var _default = ForwardRef;
exports["default"] = _default;