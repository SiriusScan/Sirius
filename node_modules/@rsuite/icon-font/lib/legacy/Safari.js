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

function Safari(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.946 15.946c0 .589-.411 1.143-1.036 1.143-.589 0-1.143-.429-1.143-1.036 0-.589.429-1.143 1.054-1.143.571 0 1.125.411 1.125 1.036zm.268 1.036l6.25-10.375c-.839.786-8.661 7.982-8.875 8.357L8.357 25.321c.821-.768 8.661-8 8.857-8.339zM28.768 16c0 2.339-.643 4.643-1.857 6.625-.179-.089-.929-.625-1.071-.625a.236.236 0 00-.232.232c0 .232.839.661 1.054.786a12.831 12.831 0 01-7.607 5.375l-.286-1.196c-.018-.161-.125-.179-.268-.179-.125 0-.196.179-.179.268l.286 1.214a12.76 12.76 0 01-2.607.268c-2.339 0-4.643-.661-6.643-1.875.107-.179.786-1.161.786-1.304a.236.236 0 00-.232-.232c-.25 0-.786 1.071-.946 1.286a12.843 12.843 0 01-5.393-7.714l1.232-.268c.143-.036.179-.143.179-.268s-.179-.196-.286-.179l-1.214.268A12.835 12.835 0 013.234 16c0-2.393.679-4.75 1.946-6.768.179.107 1.036.696 1.179.696.125 0 .232-.089.232-.214 0-.25-.946-.732-1.161-.875 1.821-2.661 4.589-4.571 7.732-5.286l.268 1.196c.036.143.143.179.268.179s.196-.179.179-.286l-.268-1.179a13.4 13.4 0 012.393-.232c2.393 0 4.732.679 6.768 1.946-.125.179-.696 1.018-.696 1.161 0 .125.089.232.214.232.25 0 .732-.929.857-1.143a12.76 12.76 0 015.268 7.625l-1 .214c-.161.036-.179.143-.179.286 0 .125.179.196.268.179l1.018-.232c.161.821.25 1.661.25 2.5zm1.518 0c0-7.893-6.393-14.286-14.286-14.286S1.714 8.107 1.714 16 8.107 30.286 16 30.286 30.286 23.893 30.286 16zM32 16c0 8.839-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0s16 7.161 16 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Safari);
var _default = ForwardRef;
exports["default"] = _default;