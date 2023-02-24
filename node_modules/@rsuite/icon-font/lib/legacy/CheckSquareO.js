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

function CheckSquareO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 16.607v5.679A5.145 5.145 0 0120 27.429H5.143A5.145 5.145 0 010 22.286V7.429a5.145 5.145 0 015.143-5.143H20c.714 0 1.429.143 2.089.446a.578.578 0 01.321.411.56.56 0 01-.161.518l-.875.875a.617.617 0 01-.411.179c-.054 0-.107-.018-.161-.036a3.129 3.129 0 00-.804-.107H5.141a2.866 2.866 0 00-2.857 2.857v14.857a2.866 2.866 0 002.857 2.857h14.857a2.866 2.866 0 002.857-2.857V17.75c0-.143.054-.286.161-.393l1.143-1.143a.571.571 0 01.411-.179c.071 0 .143.018.214.054a.56.56 0 01.357.518zm4.125-8.732L14.732 22.411a1.424 1.424 0 01-2.036 0l-7.679-7.679a1.424 1.424 0 010-2.036l1.964-1.964a1.424 1.424 0 012.036 0l4.696 4.696L25.267 3.874a1.424 1.424 0 012.036 0l1.964 1.964a1.424 1.424 0 010 2.036z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CheckSquareO);
var _default = ForwardRef;
exports["default"] = _default;