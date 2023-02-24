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

function SortAmountDesc(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 33 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M21.714 28v3.429c0 .321-.25.571-.571.571h-4.571a.564.564 0 01-.571-.571V28c0-.321.25-.571.571-.571h4.571c.321 0 .571.25.571.571zm-8.571-2.286a.656.656 0 01-.179.429l-5.696 5.696C7.143 31.946 7 32 6.857 32s-.286-.054-.411-.161L.732 26.125c-.161-.179-.214-.411-.125-.625s.304-.357.536-.357h3.429V.572c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571v24.571h3.429c.321 0 .571.25.571.571zm12-6.857v3.429c0 .321-.25.571-.571.571h-8a.564.564 0 01-.571-.571v-3.429c0-.321.25-.571.571-.571h8c.321 0 .571.25.571.571zm3.428-9.143v3.429c0 .321-.25.571-.571.571H16.571a.564.564 0 01-.571-.571V9.714c0-.321.25-.571.571-.571H28c.321 0 .571.25.571.571zM32 .571V4c0 .321-.25.571-.571.571H16.572A.564.564 0 0116.001 4V.571c0-.321.25-.571.571-.571h14.857c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SortAmountDesc);
var _default = ForwardRef;
exports["default"] = _default;