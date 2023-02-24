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

function Refresh(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.982 18.857c0 .036 0 .089-.018.125-1.518 6.321-6.732 10.732-13.321 10.732-3.482 0-6.857-1.375-9.393-3.786l-2.304 2.304c-.214.214-.5.339-.804.339a1.151 1.151 0 01-1.143-1.143v-8c0-.625.518-1.143 1.143-1.143h8c.625 0 1.143.518 1.143 1.143 0 .304-.125.589-.339.804L7.5 22.678a9.129 9.129 0 006.214 2.464 9.116 9.116 0 007.786-4.357c.429-.696.643-1.375.946-2.089.089-.25.268-.411.536-.411h3.429c.321 0 .571.268.571.571zm.447-14.286v8c0 .625-.518 1.143-1.143 1.143h-8a1.151 1.151 0 01-1.143-1.143c0-.304.125-.589.339-.804l2.464-2.464a9.187 9.187 0 00-6.232-2.446 9.116 9.116 0 00-7.786 4.357c-.429.696-.643 1.375-.946 2.089-.089.25-.268.411-.536.411H.892a.575.575 0 01-.571-.571v-.125C1.857 6.679 7.125 2.286 13.714 2.286c3.5 0 6.911 1.393 9.446 3.786l2.321-2.304c.214-.214.5-.339.804-.339.625 0 1.143.518 1.143 1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Refresh);
var _default = ForwardRef;
exports["default"] = _default;