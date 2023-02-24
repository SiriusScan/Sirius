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

function LightbulbO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 18 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.143 10.286c0 .304-.268.571-.571.571s-.571-.268-.571-.571c0-1.232-1.911-1.714-2.857-1.714-.304 0-.571-.268-.571-.571s.268-.571.571-.571c1.661 0 4 .875 4 2.857zm2.857 0c0-3.571-3.625-5.714-6.857-5.714s-6.857 2.143-6.857 5.714c0 1.143.464 2.339 1.214 3.214.339.393.732.768 1.089 1.179C5.857 16.197 6.928 17.983 7.107 20h4.071c.179-2.018 1.25-3.804 2.518-5.321.357-.411.75-.786 1.089-1.179.75-.875 1.214-2.071 1.214-3.214zm2.286 0c0 1.839-.607 3.429-1.839 4.786s-2.857 3.268-3 5.179c.518.304.839.875.839 1.464 0 .429-.161.839-.446 1.143.286.304.446.714.446 1.143 0 .589-.304 1.125-.804 1.446.143.25.232.554.232.839 0 1.161-.911 1.714-1.946 1.714-.464 1.036-1.5 1.714-2.625 1.714S6.982 29.035 6.518 28c-1.036 0-1.946-.554-1.946-1.714 0-.286.089-.589.232-.839A1.715 1.715 0 014 24.001c0-.429.161-.839.446-1.143A1.667 1.667 0 014 21.715c0-.589.321-1.161.839-1.464-.143-1.911-1.768-3.821-3-5.179S0 12.126 0 10.286c0-4.857 4.625-8 9.143-8s9.143 3.143 9.143 8z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LightbulbO);
var _default = ForwardRef;
exports["default"] = _default;