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

function CcJcb(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M34.839 17.821c0 .643-.429 1.107-.964 1.214a1.75 1.75 0 01-.321.036h-2.732v-2.5h2.732c.089 0 .25.018.321.036.536.107.964.589.964 1.214zm-.321-3.803c0 .625-.429 1.036-.946 1.125-.054.018-.179.018-.268.018h-2.482v-2.304h2.482c.089 0 .214.018.268.018.518.089.946.518.946 1.143zM13 16.946v-5.5H8.929v5.5c0 1.339-.911 2.339-2.554 2.339-1.393 0-2.768-.411-4.089-1.054v2c2.143.589 4.857.589 4.857.589 4.536 0 5.857-1.732 5.857-3.875zm12.75 3.286v-2.018c-.929.482-2.107.946-3.571 1.054-2.571.196-4.107-1.054-4.107-3.268s1.536-3.464 4.107-3.268c1.464.107 2.625.554 3.571 1.036v-2c-1.911-.482-3.714-.554-3.714-.554-6.286-.286-8.071 2.196-8.071 4.786s1.786 5.071 8.071 4.786c0 0 1.804-.071 3.714-.554zm13.107-2.053c0-1.321-1.179-2.179-2.714-2.286v-.054c1.393-.196 2.161-1.107 2.161-2.161 0-1.357-1.125-2.143-2.643-2.214-.107 0-.304-.018-.464-.018h-8.125v9.107h8.768c1.732 0 3.018-.929 3.018-2.375zm2.286-13.608v22.857a2.302 2.302 0 01-2.286 2.286H2.286A2.302 2.302 0 010 27.428V4.571a2.302 2.302 0 012.286-2.286h36.571a2.302 2.302 0 012.286 2.286z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CcJcb);
var _default = ForwardRef;
exports["default"] = _default;