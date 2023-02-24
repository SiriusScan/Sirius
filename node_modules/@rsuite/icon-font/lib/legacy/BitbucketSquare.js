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

function BitbucketSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.143 15.536c0-1.018-1.25-1.714-2.107-1.196-1.018.482-1.018 2.125.018 2.554.929.554 2.232-.286 2.089-1.357zm1.428-.286c.196 1.571-1.036 3.107-2.607 3.25s-3.054-1.143-3.125-2.732c-.054-1.179.679-2.321 1.75-2.804 1.679-.75 3.75.464 3.982 2.286zm3.072-6.982c-.786.804-1.982.911-3.036 1.036-1.911.25-3.857.232-5.786 0-1.054-.143-2.214-.268-3.036-1.036.5-.714 1.393-.857 2.196-.982 2.411-.429 4.875-.411 7.286-.018.857.125 1.821.268 2.375 1zm.75 13.321c0-.429.446-1.161-.161-1.339-3.839 2.536-9.196 2.536-13.054 0l-.214.107-.089.214c.214 1.25.411 2.518.732 3.75.732 1.268 2.304 1.696 3.643 1.929 2.536.464 5.339.321 7.643-.946 1.339-.75 1.125-2.446 1.5-3.714zm2.321-12.375c.071-.429.161-.946-.143-1.339-.679-.857-1.75-1.268-2.768-1.571-2.821-.821-5.804-.929-8.696-.643-1.375.125-2.75.357-4.036.821-.964.375-2.268.875-2.429 2.018.321 2.679.839 5.304 1.286 7.964.143.75.143 1.643.821 2.179 1.446 1.107 3.286 1.589 5.071 1.786 2.643.286 5.446.089 7.857-1.125.679-.357 1.464-.821 1.607-1.643.5-2.804.982-5.607 1.429-8.446zm4.715-1.785v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(BitbucketSquare);
var _default = ForwardRef;
exports["default"] = _default;