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

function Fonticons(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M0 2.286h27.429v27.429H0V2.286zM16.214 8L16 8.589l1.339 1.482-.554 2.036.446.446 1.911-1.018 1.911 1.018.446-.446-.554-2.036 1.339-1.482L22.07 8h-1.696l-.946-1.714h-.571L17.911 8h-1.696zm-4.768 2.911c.732 0 1.018.268 1 1.411l3.107-.375c0-2.732-1.875-3.232-3.964-3.232-3.107 0-4.732 1.25-4.732 4.286v1.286H5.143v2.286H6.5c.179 0 .357 0 .357.143v6.821c0 .339-.089.446-.411.482l-1.304.125v1.571h8v-1.536l-2.661-.25c-.321-.036-.196-.089-.196-.446v-6.911h3.411l.679-2.286H10.25c-.179 0 .036-.125.036-.268v-1.429c0-1.071.036-1.679 1.161-1.679zm10.84 14.803v-1.536l-.964-.161c-.339-.054-.179-.089-.179-.446v-9.286h-4.911l-.411 1.804 1.482.393c.232.071.411.232.411.482v6.607c0 .339-.143.411-.464.446l-1.25.161v1.536h6.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Fonticons);
var _default = ForwardRef;
exports["default"] = _default;