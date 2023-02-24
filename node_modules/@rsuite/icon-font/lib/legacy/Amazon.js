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

function Amazon(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.696 26.357c.536-.268.946.143.393.857S23.089 32 15.625 32 2.446 26.893.696 24.786c-.482-.554.071-.804.393-.589 5.232 3.179 13.411 8.411 26.607 2.161zm3.697-2.053c.268.357 0 1.929-.464 3.071-.464 1.125-1.143 1.911-1.518 2.214-.393.321-.679.196-.464-.268s1.375-3.321.911-3.929c-.464-.589-2.643-.304-3.429-.232-.768.071-.929.143-1-.018-.161-.411 1.554-1.107 2.679-1.25 1.125-.125 2.929-.054 3.286.411zm-7.036-7.911c0 1.964 2.304 3.768 2.304 3.768l-4.054 4c-1.589-1.5-2.786-2.75-2.786-2.75a3.422 3.422 0 01-.446-.589c-3.232 5.054-13.107 4.732-13.107-3.089 0-7.286 8.625-8.268 12.107-8.393V7.072c0-.482.179-2.679-2.536-2.679 0 0-2.714 0-3.875 3.536l-5.25-.482c0-3.518 3.339-7.446 9.625-7.446 6.268 0 8.018 4.071 8.018 5.875v10.518zm-12 .375c0 3.625 6.018 4.482 6.018-1.232v-2.893c-2.411.071-6.018.75-6.018 4.125z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Amazon);
var _default = ForwardRef;
exports["default"] = _default;