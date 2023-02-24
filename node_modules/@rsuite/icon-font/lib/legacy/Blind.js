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

function Blind(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 25 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.536 5.554A2.79 2.79 0 013.75 2.768C3.75 1.25 5 0 6.536 0s2.768 1.25 2.768 2.768a2.774 2.774 0 01-2.768 2.786zm9.839 11.464c0 1.929-2.054 1.5-2.518.714L7.303 9.911c-.286-.464-.5-.25-.5-.25s-.125.143.071.375l2.179 2.482.018 6.321C7.535 23.303 6.196 27 6.196 27c-.839 2.393-1.536 4.464-2.143 4.75-.732.375-1.268.286-1.839.018-.75-.339-.964-1.25-.911-1.786 0 0 .036-.286 3.518-11.036l.089-7.429-1.518 2.929.625 3.964c.232 1.5-1.036 1.696-1.036 1.696-1.214.196-1.464-1.214-1.464-1.25l-.821-5.339c3.75-6.768 3.768-6.804 3.768-6.804.286-.429.929-.607 2.018-.607.964 0 1.571.286 1.911.714l7.571 9.304c.107.071.179.179.25.304l.054.054-.018.018c.089.161.125.339.125.518zm-7.196 2.678c1.714 4.554 3.25 8 3.25 8 .518 1.321 1.411 3.214.107 3.964-1.286.75-2.321-.125-2.607-.732h-.018a3.278 3.278 0 01-.143-.446l-2.214-6.268zm14.714 10.572c.375.589.696 1.018.5 1.143-.339.214-.446-.411-.821-1.018 0 0-2.018-3.054-7.554-11.804.107.036.304-.125.304-.125s.196-.161.196-.304c5.5 8.982 7.375 12.107 7.375 12.107z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Blind);
var _default = ForwardRef;
exports["default"] = _default;