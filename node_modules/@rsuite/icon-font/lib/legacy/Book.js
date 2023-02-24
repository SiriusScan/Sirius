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

function Book(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.268 8.536c.446.643.571 1.482.321 2.304l-4.911 16.179c-.446 1.518-2.018 2.696-3.554 2.696H4.642c-1.821 0-3.768-1.446-4.429-3.304-.286-.804-.286-1.589-.036-2.268.036-.357.107-.714.125-1.143.018-.286-.143-.518-.107-.732.071-.429.446-.732.732-1.214.536-.893 1.143-2.339 1.339-3.268.089-.339-.089-.732 0-1.036.089-.339.429-.589.607-.911.482-.821 1.107-2.411 1.196-3.25.036-.375-.143-.786-.036-1.071.125-.411.518-.589.786-.946.429-.589 1.143-2.286 1.25-3.232.036-.304-.143-.607-.089-.929.071-.339.5-.696.786-1.107.75-1.107.893-3.554 3.161-2.911l-.018.054c.304-.071.607-.161.911-.161h13.589c.839 0 1.589.375 2.036 1 .464.643.571 1.482.321 2.321l-4.893 16.179c-.839 2.75-1.304 3.357-3.571 3.357H2.784c-.232 0-.518.054-.679.268-.143.214-.161.375-.018.768.357 1.036 1.589 1.25 2.571 1.25H21.14c.661 0 1.429-.375 1.625-1.018l5.357-17.625c.107-.339.107-.696.089-1.018.411.161.786.411 1.054.768zm-19 .035c-.107.321.071.571.393.571h10.857c.304 0 .643-.25.75-.571l.375-1.143c.107-.321-.071-.571-.393-.571H11.393c-.304 0-.643.25-.75.571zm-1.482 4.572c-.107.321.071.571.393.571h10.857c.304 0 .643-.25.75-.571L21.161 12c.107-.321-.071-.571-.393-.571H9.911c-.304 0-.643.25-.75.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Book);
var _default = ForwardRef;
exports["default"] = _default;