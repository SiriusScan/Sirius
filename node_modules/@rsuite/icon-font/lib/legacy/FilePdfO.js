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

function FilePdfO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.214 6.786c.661.661 1.214 1.982 1.214 2.929v20.571c0 .946-.768 1.714-1.714 1.714h-24A1.715 1.715 0 010 30.286V1.715C0 .769.768.001 1.714.001h16c.946 0 2.268.554 2.929 1.214zm-7.928-4.357v6.714H25c-.107-.304-.268-.607-.393-.732l-5.589-5.589c-.125-.125-.429-.286-.732-.393zm6.857 27.285V11.428h-7.429A1.715 1.715 0 0116 9.714V2.285H2.286v27.429h22.857zm-9.179-10.589c.446.357.946.679 1.5 1 .75-.089 1.446-.125 2.089-.125 1.196 0 2.714.143 3.161.875.125.179.232.5.036.929-.018.018-.036.054-.054.071v.018c-.054.321-.321.679-1.268.679-1.143 0-2.875-.518-4.375-1.304-2.482.268-5.089.821-7 1.482-1.839 3.143-3.25 4.679-4.321 4.679a.993.993 0 01-.5-.125l-.429-.214c-.054-.018-.071-.054-.107-.089-.089-.089-.161-.286-.107-.643.179-.821 1.143-2.196 3.357-3.357.143-.089.321-.036.411.107a.137.137 0 01.036.071 46.243 46.243 0 001.911-3.518c.804-1.607 1.429-3.179 1.857-4.679-.571-1.946-.75-3.946-.429-5.125.125-.446.393-.714.75-.714h.393c.268 0 .482.089.625.268.214.25.268.643.161 1.214a.37.37 0 01-.071.143c.018.054.018.089.018.143v.536c-.018 1.125-.036 2.196-.25 3.429.625 1.875 1.554 3.393 2.607 4.25zM5.679 26.464c.536-.25 1.304-1.018 2.446-2.821-1.339 1.036-2.179 2.214-2.446 2.821zm7.107-16.428c-.179.5-.179 1.357-.036 2.357.054-.286.089-.554.125-.786.036-.304.089-.554.125-.768a.56.56 0 01.071-.143c-.018-.018-.018-.054-.036-.089-.018-.321-.125-.518-.232-.643 0 .036-.018.054-.018.071zm-2.215 11.803a27.206 27.206 0 015.071-1.446c-.179-.143-.357-.268-.518-.411-.875-.768-1.661-1.839-2.268-3.143-.339 1.089-.839 2.25-1.482 3.518-.268.5-.536 1-.804 1.482zm11.536-.285c-.089-.089-.554-.429-2.5-.429.875.321 1.679.5 2.214.5.161 0 .25 0 .321-.018 0-.018-.018-.036-.036-.054z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FilePdfO);
var _default = ForwardRef;
exports["default"] = _default;