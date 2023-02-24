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

function Vk(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 35 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M34.232 9.286c.268.732-.571 2.446-2.679 5.25-3.464 4.607-3.839 4.179-.982 6.839 2.75 2.554 3.321 3.786 3.411 3.946 0 0 1.143 2-1.268 2.018l-4.571.071c-.982.196-2.286-.696-2.286-.696-1.714-1.179-3.321-4.232-4.571-3.839 0 0-1.286.411-1.25 3.161.018.589-.268.911-.268.911s-.321.339-.946.393h-2.054c-4.518.286-8.5-3.875-8.5-3.875S3.911 18.965.089 9.983c-.25-.589.018-.875.018-.875s.268-.339 1.018-.339l4.893-.036c.464.071.786.321.786.321s.286.196.429.571c.804 2 1.839 3.821 1.839 3.821 1.786 3.679 3 4.304 3.696 3.929 0 0 .911-.554.714-5-.071-1.607-.518-2.339-.518-2.339-.411-.554-1.179-.714-1.518-.768-.268-.036.179-.679.768-.964.875-.429 2.429-.446 4.268-.429 1.446.018 1.857.107 2.411.232 1.696.411 1.125 1.982 1.125 5.768 0 1.214-.232 2.911.643 3.464.375.25 1.304.036 3.589-3.857 0 0 1.071-1.857 1.911-4.018.143-.393.446-.554.446-.554s.286-.161.679-.107l5.143-.036c1.554-.196 1.804.518 1.804.518z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Vk);
var _default = ForwardRef;
exports["default"] = _default;