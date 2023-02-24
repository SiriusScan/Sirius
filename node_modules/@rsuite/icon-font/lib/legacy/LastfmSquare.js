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

function LastfmSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.571 18.786c0-2.518-2.036-3.661-4.179-4.268-.982-.268-1.786-.5-2.143-1.571-.018-.089-.107-.429-.107-.5 0-.857.679-1.482 1.518-1.482.393 0 .946-.018 1.268.268h-.018c.339.25.5.536.696.911l1.661-1.268c-.268-.375-.536-.821-.875-1.143-.839-.75-1.625-.875-2.732-.875-1.875 0-3.643 1.536-3.643 3.482 0 .143.018.268.036.411.393 2.429 1.625 3.179 3.804 3.804 1.071.304 2.589.786 2.607 2.107v.089c.018 1.429-1.179 2.286-2.518 2.286-1.464 0-2.411-1.393-2.982-2.571-2.071-4.268-2.393-9.607-8.536-9.607-3.696 0-7.018 3.411-6.893 7.071v.018c.125 3.821 2.75 7.196 6.786 7.196 1.911 0 3.696-.446 4.982-1.964a4.79 4.79 0 00.554-.911l-1.071-1.946c-1 1.893-2.232 2.714-4.375 2.714-2.821 0-4.768-2.5-4.768-5.196 0-2.482 2.286-4.875 4.786-4.875 2.857 0 3.893 1.482 4.893 4.036 1.196 3.071 2.482 8.143 6.625 8.143 2.482 0 4.625-1.804 4.625-4.357zm1.858-11.357v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(LastfmSquare);
var _default = ForwardRef;
exports["default"] = _default;