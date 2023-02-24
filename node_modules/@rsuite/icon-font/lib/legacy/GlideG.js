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

function GlideG(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M13.286 5.446c0-.946-.089-1.768-1.232-1.768-.482 0-.964.161-1.393.411-2.696 1.482-3.804 5.321-3.804 8.214 0 1.929.661 4.5 3.018 4.5.536 0 1.214.143 1.357-.482l1.714-8.268c.179-.857.339-1.732.339-2.607zM26.75 17.161c0 .179-.232.357-.411.357l-.107-.018c-1.214-.179-2.286-.5-3.518-.5-2.232 0-4.286.661-6.268 1.661-.25.125-.304.232-.375.482-.321 1.214-.536 2.464-.839 3.679-1.071 4.161-4.554 9.179-9.321 9.179-3.25 0-5.25-2.214-5.25-5.411 0-1.732 1.125-5.107 3.214-5.107.732 0 3.607.946 3.625 1.696-.036.143-2.804 1.571-2.804 3.982 0 .732.357 1.304 1.161 1.304 2.839 0 4.143-5.179 4.429-7.357v-.161c0-.143-.571-.071-.679-.071-5.375 0-8.518-3-8.518-8.411C1.089 7.358 4.41 1.126 9.857.179c.625-.107 1.25-.161 1.893-.161 4.321 0 6.679 2.018 6.679 6.429 0 2.982-1.018 5.732-1.446 8.643l.054.054c1.929-1.089 3.964-2.125 6.25-2.125.232 0 .732.143.946.232.464.179 2.518 3.411 2.518 3.911z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(GlideG);
var _default = ForwardRef;
exports["default"] = _default;