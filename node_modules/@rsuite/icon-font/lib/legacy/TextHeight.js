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

function TextHeight(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M31.143 25.143c.786 0 1.036.5.554 1.125l-2.25 2.893c-.482.625-1.268.625-1.75 0l-2.25-2.893c-.482-.625-.232-1.125.554-1.125h1.429V6.857h-1.429c-.786 0-1.036-.5-.554-1.125l2.25-2.893c.482-.625 1.268-.625 1.75 0l2.25 2.893c.482.625.232 1.125-.554 1.125h-1.429v18.286h1.429zM1.446 2.304l.964.482c.125.054 3.393.089 3.768.089 1.571 0 3.143-.071 4.714-.071 1.286 0 2.554.018 3.839.018h5.232c.714 0 1.125.161 1.607-.518l.75-.018c.161 0 .339.018.5.018.036 2 .036 4 .036 6 0 .625.018 1.321-.089 1.946a5.77 5.77 0 01-1.214.321c-.411-.714-.696-1.5-.964-2.286-.125-.357-.554-2.768-.589-2.804-.375-.464-.786-.375-1.339-.375-1.625 0-3.321-.071-4.929.125-.089.786-.161 1.625-.143 2.429.018 5.018.071 10.036.071 15.054 0 1.375-.214 2.821.179 4.143 1.357.696 2.964.804 4.357 1.429.036.286.089.589.089.893 0 .161-.018.339-.054.518l-.607.018c-2.536.071-5.036-.321-7.589-.321-1.804 0-3.607.321-5.411.321-.018-.304-.054-.625-.054-.929v-.161c.679-1.089 3.125-1.107 4.25-1.768.393-.875.339-5.714.339-6.839 0-3.607-.107-7.214-.107-10.821V7.108c0-.321.071-1.607-.143-1.857-.25-.268-2.589-.214-2.893-.214-.661 0-2.571.304-3.089.679-.857.589-.857 4.161-1.929 4.232-.321-.196-.768-.482-1-.786V2.323z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(TextHeight);
var _default = ForwardRef;
exports["default"] = _default;