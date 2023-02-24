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

function Braille(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 39 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M3.429 21.143C1.858 21.143.572 22.429.572 24s1.286 2.857 2.857 2.857S6.286 25.571 6.286 24 5 21.143 3.429 21.143zm9.142 0C11 21.143 9.714 22.429 9.714 24s1.286 2.857 2.857 2.857 2.857-1.286 2.857-2.857-1.286-2.857-2.857-2.857zm0-9.143C11 12 9.714 13.286 9.714 14.857s1.286 2.857 2.857 2.857 2.857-1.286 2.857-2.857S14.142 12 12.571 12zm13.715 9.143c-1.571 0-2.857 1.286-2.857 2.857s1.286 2.857 2.857 2.857 2.857-1.286 2.857-2.857-1.286-2.857-2.857-2.857zm9.143 0c-1.571 0-2.857 1.286-2.857 2.857s1.286 2.857 2.857 2.857 2.857-1.286 2.857-2.857-1.286-2.857-2.857-2.857zM26.286 12c-1.571 0-2.857 1.286-2.857 2.857s1.286 2.857 2.857 2.857 2.857-1.286 2.857-2.857S27.857 12 26.286 12zm9.143 0c-1.571 0-2.857 1.286-2.857 2.857s1.286 2.857 2.857 2.857 2.857-1.286 2.857-2.857S37 12 35.429 12zm0-9.143c-1.571 0-2.857 1.286-2.857 2.857s1.286 2.857 2.857 2.857 2.857-1.286 2.857-2.857S37 2.857 35.429 2.857zM6.857 24a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zM16 24a3.43 3.43 0 01-6.858 0A3.43 3.43 0 0116 24zm-9.143-9.143a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zm9.143 0a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zM6.857 5.714a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zM29.714 24a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zM16 5.714a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zM38.857 24a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zm-9.143-9.143a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zm9.143 0a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zm-9.143-9.143a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zm9.143 0a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Braille);
var _default = ForwardRef;
exports["default"] = _default;