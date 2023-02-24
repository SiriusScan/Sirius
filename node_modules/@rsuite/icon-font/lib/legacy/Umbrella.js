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

function Umbrella(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 14.786v10.357c0 2.482-2.089 4.571-4.571 4.571s-4.571-2.089-4.571-4.571c0-.625.518-1.143 1.143-1.143s1.143.518 1.143 1.143c0 1.196 1.089 2.286 2.286 2.286s2.286-1.089 2.286-2.286V14.786c.375-.125.75-.196 1.143-.196s.768.071 1.143.196zm13.714.482a.587.587 0 01-.571.571c-.161 0-.286-.071-.411-.179-1.036-.964-2-1.643-3.482-1.643-1.696 0-3.161 1.054-4.125 2.393-.214.304-.375.625-.571.929-.125.196-.268.304-.5.304-.25 0-.393-.107-.518-.304-.196-.304-.357-.625-.571-.929-.964-1.339-2.411-2.393-4.107-2.393s-3.143 1.054-4.107 2.393c-.214.304-.375.625-.571.929-.125.196-.268.304-.518.304-.232 0-.375-.107-.5-.304-.196-.304-.357-.625-.571-.929-.964-1.339-2.429-2.393-4.125-2.393-1.482 0-2.446.679-3.482 1.643-.125.107-.25.179-.411.179a.587.587 0 01-.571-.571c0-.054 0-.089.018-.125C1.663 8.393 8.181 4.572 14.859 4.572c6.643 0 13.232 3.821 14.839 10.571.018.036.018.071.018.125zM16 2.286v1.75C15.625 4.018 15.232 4 14.857 4s-.768.018-1.143.036v-1.75c0-.625.518-1.143 1.143-1.143S16 1.661 16 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Umbrella);
var _default = ForwardRef;
exports["default"] = _default;