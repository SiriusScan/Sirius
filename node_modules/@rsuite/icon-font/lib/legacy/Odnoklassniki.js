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

function Odnoklassniki(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 16.196c-4.464 0-8.107-3.625-8.107-8.089C3.322 3.625 6.965 0 11.429 0s8.107 3.625 8.107 8.107c0 4.464-3.643 8.089-8.107 8.089zm0-12.089a3.99 3.99 0 00-3.982 4c0 2.196 1.786 3.982 3.982 3.982s3.982-1.786 3.982-3.982c0-2.214-1.786-4-3.982-4zm9.339 13.072c.786 1.607-.107 2.375-2.143 3.696-1.714 1.089-4.071 1.518-5.625 1.679l1.304 1.286 4.768 4.768c.714.732.714 1.911 0 2.625l-.214.232a1.898 1.898 0 01-2.643 0c-1.196-1.214-2.946-2.964-4.768-4.786l-4.768 4.786c-.732.714-1.911.714-2.625 0l-.214-.232a1.843 1.843 0 010-2.625c1.214-1.214 2.946-2.964 4.768-4.768l1.286-1.286c-1.536-.161-3.929-.571-5.661-1.679-2.036-1.321-2.929-2.089-2.143-3.696.464-.911 1.732-1.679 3.411-.357 0 0 2.268 1.804 5.929 1.804s5.929-1.804 5.929-1.804c1.679-1.321 2.946-.554 3.411.357z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Odnoklassniki);
var _default = ForwardRef;
exports["default"] = _default;