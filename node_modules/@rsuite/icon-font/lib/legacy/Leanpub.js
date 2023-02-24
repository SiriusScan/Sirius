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

function Leanpub(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M33.804 7l2.768 22.714c-1.661 0-3.089-.339-4.589-1.018-2.232-1.018-4.554-1.625-7.018-1.625-2.536 0-4.875.839-6.679 2.643-1.804-1.804-4.143-2.643-6.679-2.643-2.464 0-4.786.607-7.018 1.625-1.446.643-2.911 1.018-4.5 1.018H0L2.768 7c2.554-1.446 5.661-2.268 8.607-2.268 2.411 0 4.893.5 6.911 1.893 2.018-1.393 4.5-1.893 6.911-1.893 2.946 0 6.054.821 8.607 2.268zm-8.84 17.625c3.393 0 5.714.911 8.786 2.179L31.536 8.572c-2-.911-4.375-1.393-6.571-1.393-2.5 0-4.839.786-6.679 2.518-1.839-1.732-4.179-2.518-6.679-2.518-2.196 0-4.571.482-6.571 1.393L2.822 26.804c3.071-1.268 5.393-2.179 8.786-2.179 2.446 0 4.607.625 6.679 1.929 2.071-1.304 4.232-1.929 6.679-1.929zm.715-.607l-.982-16.196c-2.571.054-4.607.929-6.411 2.768-1.875-1.911-4-2.768-6.679-2.768-2 0-4.143.411-6 1.179L3.571 25.805c2.696-1.107 5.071-1.804 8.036-1.804 2.357 0 4.661.571 6.679 1.821a12.108 12.108 0 016.679-1.821z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Leanpub);
var _default = ForwardRef;
exports["default"] = _default;