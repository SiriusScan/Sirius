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

function Question(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 20 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.571 22.429v4.286a.716.716 0 01-.714.714H7.571a.716.716 0 01-.714-.714v-4.286c0-.393.321-.714.714-.714h4.286c.393 0 .714.321.714.714zm5.643-10.715c0 3.393-2.304 4.696-4 5.643-1.054.607-1.714 1.839-1.714 2.357 0 .393-.304.857-.714.857H7.5c-.393 0-.643-.607-.643-1v-.804c0-2.161 2.143-4.018 3.714-4.732 1.375-.625 1.946-1.214 1.946-2.357 0-1-1.304-1.893-2.75-1.893-.804 0-1.536.25-1.929.518-.429.304-.857.732-1.911 2.054a.738.738 0 01-.554.286.824.824 0 01-.446-.143l-2.929-2.232a.704.704 0 01-.179-.946c1.929-3.196 4.643-4.75 8.286-4.75 3.821 0 8.107 3.054 8.107 7.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Question);
var _default = ForwardRef;
exports["default"] = _default;