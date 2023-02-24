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

function Glide(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15.464 9.196c0 .571-.125 1.125-.232 1.679-.375 1.786-.732 3.571-1.107 5.357-.054.25-.054.25-.321.268a5.723 5.723 0 01-.554.036c-1.536 0-1.964-1.661-1.964-2.911 0-1.857.732-4.339 2.464-5.321.286-.143.589-.25.911-.25.732 0 .804.536.804 1.143zm8.679 7.572c0-.321-1.321-2.411-1.625-2.536-.143-.054-.446-.143-.607-.143-1.464 0-2.786.661-4.036 1.375l-.036-.036c.286-1.911.929-3.607.929-5.589 0-2.839-1.518-4.161-4.321-4.161-.411 0-.821.054-1.214.107-3.518.625-5.661 4.643-5.661 7.946 0 3.5 2.018 5.429 5.5 5.429.071 0 .446-.036.446.054 0 .036 0 .054-.018.089-.071.679-.286 1.429-.464 2.089-.268.982-1.196 2.679-2.393 2.679-.518 0-.75-.357-.75-.839 0-1.554 1.786-2.482 1.821-2.571 0-.071-.089-.143-.125-.179-.554-.5-1.464-.911-2.214-.911-1.357 0-2.089 2.179-2.089 3.286 0 2.071 1.304 3.5 3.393 3.5 3.089 0 5.339-3.25 6.036-5.929.196-.786.339-1.589.536-2.375.036-.161.089-.232.25-.321 1.268-.643 2.607-1.071 4.054-1.071.786 0 1.482.143 2.268.321.018.018.054.018.071.018.107 0 .25-.125.25-.232zm3.286-9.339v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Glide);
var _default = ForwardRef;
exports["default"] = _default;