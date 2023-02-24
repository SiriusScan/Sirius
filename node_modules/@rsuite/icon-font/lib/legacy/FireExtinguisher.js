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

function FireExtinguisher(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.143 3.429c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143S7.375 4.572 8 4.572s1.143-.518 1.143-1.143zm16-.572v5.714a.54.54 0 01-.214.446.547.547 0 01-.357.125c-.036 0-.071 0-.125-.018l-8-1.714a.574.574 0 01-.446-.554H11.43v1.821a5.727 5.727 0 014.571 5.607V28.57c0 .625-.518 1.143-1.143 1.143H5.715a1.151 1.151 0 01-1.143-1.143V14.284a5.696 5.696 0 014-5.446V6.856h-.571c-3.786 0-5.821 3.911-5.839 3.946a1.147 1.147 0 01-1.018.625A1.147 1.147 0 01.126 9.766c.089-.179 1.875-3.643 5.464-4.804a2.969 2.969 0 01-.446-1.536C5.144 1.855 6.43.569 8.001.569s2.857 1.286 2.857 2.857c0 .411-.089.786-.25 1.143h5.393c0-.268.196-.5.446-.554l8-1.714c.054-.018.089-.018.125-.018.125 0 .25.036.357.125a.54.54 0 01.214.446z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FireExtinguisher);
var _default = ForwardRef;
exports["default"] = _default;