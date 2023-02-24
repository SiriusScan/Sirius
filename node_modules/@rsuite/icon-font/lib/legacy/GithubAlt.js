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

function GithubAlt(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.429 21.714c0 1.304-.679 3.429-2.286 3.429s-2.286-2.125-2.286-3.429.679-3.429 2.286-3.429 2.286 2.125 2.286 3.429zm11.428 0c0 1.304-.679 3.429-2.286 3.429s-2.286-2.125-2.286-3.429.679-3.429 2.286-3.429 2.286 2.125 2.286 3.429zm2.857 0c0-2.732-1.661-5.143-4.571-5.143-1.179 0-2.304.214-3.482.375-.929.143-1.857.196-2.804.196s-1.875-.054-2.804-.196c-1.161-.161-2.304-.375-3.482-.375C5.66 16.571 4 18.982 4 21.714c0 5.464 5 6.304 9.357 6.304h3c4.357 0 9.357-.839 9.357-6.304zm4-3.143c0 1.982-.196 4.089-1.089 5.911-2.357 4.768-8.839 5.232-13.482 5.232-4.714 0-11.589-.411-14.036-5.232C.196 22.678 0 20.553 0 18.571 0 15.964.714 13.5 2.429 11.5a9.822 9.822 0 01-.482-3.036c0-1.339.304-2.679.911-3.893 2.821 0 4.625 1.232 6.768 2.911a23.863 23.863 0 015.518-.625c1.679 0 3.375.179 5 .571 2.125-1.661 3.929-2.857 6.714-2.857a8.717 8.717 0 01.911 3.893 9.515 9.515 0 01-.482 3c1.714 2.018 2.429 4.5 2.429 7.107z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(GithubAlt);
var _default = ForwardRef;
exports["default"] = _default;