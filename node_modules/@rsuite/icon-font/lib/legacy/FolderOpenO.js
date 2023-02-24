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

function FolderOpenO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M31.804 16.625c0-.5-.554-.625-.946-.625H11.429c-.946 0-2.196.589-2.804 1.321l-5.25 6.482c-.161.214-.321.446-.321.714 0 .5.554.625.946.625h19.429c.946 0 2.196-.589 2.804-1.339l5.25-6.482c.161-.196.321-.429.321-.696zm-20.375-2.911h13.714v-2.857c0-.946-.768-1.714-1.714-1.714H13.143a1.715 1.715 0 01-1.714-1.714V6.286c0-.946-.768-1.714-1.714-1.714H4.001c-.946 0-1.714.768-1.714 1.714v15.232l4.571-5.625c1.036-1.268 2.946-2.179 4.571-2.179zm22.66 2.911c0 .786-.339 1.536-.821 2.143L28 25.25c-1.018 1.25-2.964 2.179-4.571 2.179H4c-2.196 0-4-1.804-4-4V6.286c0-2.196 1.804-4 4-4h5.714c2.196 0 4 1.804 4 4v.571h9.714c2.196 0 4 1.804 4 4v2.857h3.429c1.214 0 2.429.554 2.964 1.696.179.375.268.786.268 1.214z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FolderOpenO);
var _default = ForwardRef;
exports["default"] = _default;