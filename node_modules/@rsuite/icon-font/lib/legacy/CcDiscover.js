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

function CcDiscover(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.589 13.875c0 .571-.232 1.125-.643 1.5-.357.321-.839.464-1.589.464h-.304V11.91h.304c.75 0 1.214.125 1.589.482.411.357.643.911.643 1.482zm31.715-1.161c0 .607-.393.929-1.143.929h-.339v-1.804h.357c.732 0 1.125.304 1.125.875zM6.786 13.875c0-1.75-1.304-2.982-3.196-2.982H1.894v5.946H3.59c.893 0 1.554-.196 2.125-.679a2.995 2.995 0 001.071-2.286zm.535 2.964h1.161v-5.946H7.321v5.946zm5.715-1.803c0-.946-.393-1.375-1.714-1.857-.696-.25-.893-.429-.893-.75 0-.375.357-.661.857-.661.357 0 .643.143.946.482l.607-.786a2.581 2.581 0 00-1.75-.661c-1.054 0-1.857.732-1.857 1.696 0 .821.375 1.25 1.464 1.643.446.161.679.25.804.339a.68.68 0 01.339.607c0 .482-.375.839-.893.839-.554 0-1-.268-1.268-.786l-.75.714c.536.786 1.179 1.143 2.054 1.143 1.214 0 2.054-.804 2.054-1.964zM18 16.643v-1.375c-.464.464-.875.661-1.393.661-1.179 0-2-.857-2-2.054 0-1.143.857-2.054 1.946-2.054.554 0 .964.196 1.446.679v-1.375c-.5-.25-.929-.357-1.429-.357-1.75 0-3.161 1.375-3.161 3.107 0 1.75 1.375 3.107 3.143 3.107.5 0 .929-.089 1.446-.339zm22 10.786v-9.411c-2.857 1.786-12.911 7.5-29.161 10.554h28.018c.625 0 1.143-.518 1.143-1.143zM24.804 13.911c0-1.786-1.446-3.232-3.232-3.232s-3.232 1.446-3.232 3.232 1.446 3.232 3.232 3.232 3.232-1.446 3.232-3.232zM27.518 17l2.571-6.107h-1.268l-1.607 4-1.589-4h-1.268L26.893 17h.625zm3.089-.161h3.286v-1h-2.125v-1.607h2.054v-1h-2.054v-1.321h2.125v-1.018h-3.286v5.946zm6.982 0h1.429l-1.875-2.5c.875-.179 1.357-.768 1.357-1.679 0-1.125-.768-1.768-2.107-1.768h-1.732v5.946h1.161v-2.375h.161zm3.554-12.16v22.643c0 1.321-1.054 2.393-2.357 2.393H2.357C1.053 29.715 0 28.644 0 27.322V4.679c0-1.321 1.054-2.393 2.357-2.393h36.429c1.304 0 2.357 1.071 2.357 2.393z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CcDiscover);
var _default = ForwardRef;
exports["default"] = _default;