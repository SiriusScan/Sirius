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

function Female(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M22.857 18.857a1.715 1.715 0 01-3.143.946l-4.054-6.089h-.804v2.357l4.411 7.339c.107.179.161.375.161.589 0 .625-.518 1.143-1.143 1.143h-3.429v4.857c0 1.107-.893 2-2 2H9.999c-1.089 0-2-.893-2-2v-4.857H4.57a1.151 1.151 0 01-1.143-1.143c0-.214.054-.411.161-.589l4.411-7.339v-2.357h-.804l-4.054 6.089a1.715 1.715 0 01-2.857-1.892l4.571-6.857C5.569 10 6.676 9.143 7.998 9.143h6.857c1.321 0 2.429.857 3.143 1.911l4.571 6.857c.179.268.286.607.286.946zM15.429 4.571c0 2.214-1.786 4-4 4s-4-1.786-4-4 1.786-4 4-4 4 1.786 4 4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Female);
var _default = ForwardRef;
exports["default"] = _default;