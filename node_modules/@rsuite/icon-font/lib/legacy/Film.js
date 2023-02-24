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

function Film(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6.857 28.571v-2.286c0-.625-.518-1.143-1.143-1.143H3.428c-.625 0-1.143.518-1.143 1.143v2.286c0 .625.518 1.143 1.143 1.143h2.286c.625 0 1.143-.518 1.143-1.143zm0-6.857v-2.286c0-.625-.518-1.143-1.143-1.143H3.428c-.625 0-1.143.518-1.143 1.143v2.286c0 .625.518 1.143 1.143 1.143h2.286c.625 0 1.143-.518 1.143-1.143zm0-6.857v-2.286c0-.625-.518-1.143-1.143-1.143H3.428c-.625 0-1.143.518-1.143 1.143v2.286c0 .625.518 1.143 1.143 1.143h2.286c.625 0 1.143-.518 1.143-1.143zm18.286 13.714v-9.143c0-.625-.518-1.143-1.143-1.143H10.286c-.625 0-1.143.518-1.143 1.143v9.143c0 .625.518 1.143 1.143 1.143H24c.625 0 1.143-.518 1.143-1.143zM6.857 8V5.714c0-.625-.518-1.143-1.143-1.143H3.428c-.625 0-1.143.518-1.143 1.143V8c0 .625.518 1.143 1.143 1.143h2.286c.625 0 1.143-.518 1.143-1.143zM32 28.571v-2.286c0-.625-.518-1.143-1.143-1.143h-2.286c-.625 0-1.143.518-1.143 1.143v2.286c0 .625.518 1.143 1.143 1.143h2.286c.625 0 1.143-.518 1.143-1.143zm-6.857-13.714V5.714c0-.625-.518-1.143-1.143-1.143H10.286c-.625 0-1.143.518-1.143 1.143v9.143c0 .625.518 1.143 1.143 1.143H24c.625 0 1.143-.518 1.143-1.143zM32 21.714v-2.286c0-.625-.518-1.143-1.143-1.143h-2.286c-.625 0-1.143.518-1.143 1.143v2.286c0 .625.518 1.143 1.143 1.143h2.286c.625 0 1.143-.518 1.143-1.143zm0-6.857v-2.286c0-.625-.518-1.143-1.143-1.143h-2.286c-.625 0-1.143.518-1.143 1.143v2.286c0 .625.518 1.143 1.143 1.143h2.286c.625 0 1.143-.518 1.143-1.143zM32 8V5.714c0-.625-.518-1.143-1.143-1.143h-2.286c-.625 0-1.143.518-1.143 1.143V8c0 .625.518 1.143 1.143 1.143h2.286C31.482 9.143 32 8.625 32 8zm2.286-2.857v24A2.866 2.866 0 0131.429 32H2.858a2.866 2.866 0 01-2.857-2.857v-24a2.866 2.866 0 012.857-2.857h28.571a2.866 2.866 0 012.857 2.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Film);
var _default = ForwardRef;
exports["default"] = _default;