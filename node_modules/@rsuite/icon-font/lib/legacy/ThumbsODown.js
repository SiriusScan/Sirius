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

function ThumbsODown(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4.571 8c0-.625-.518-1.143-1.143-1.143S2.285 7.375 2.285 8s.518 1.143 1.143 1.143S4.571 8.625 4.571 8zm20.572 10.286c0-.661-.5-2.268-1.339-2.286.375-.429.625-1.268.625-1.839 0-.839-.339-1.554-.946-2.125.214-.375.321-.804.321-1.232 0-.821-.411-1.839-1.161-2.25.054-.321.089-.661.089-1 0-2.089-1.321-2.982-3.304-2.982h-2.286c-2.107 0-4.143.625-6.107 1.304-.964.339-2.607.982-3.607.982h-.571v11.429h.571c1.411 0 3.536 3.054 4.339 4.089.446.554.875 1.107 1.375 1.625 1.732 1.821 1.143 4.554 2.286 5.714 2.446 0 2.857-1.339 2.857-3.429 0-2.107-1.714-3.625-1.714-5.714h6.286c1.196 0 2.286-1.071 2.286-2.286zm2.286.018c0 2.464-2.107 4.554-4.571 4.554h-3.143c.536 1.107.857 2.179.857 3.429 0 1.179-.071 2.25-.625 3.321-.875 1.732-2.661 2.393-4.518 2.393a2.33 2.33 0 01-1.607-.661c-1.786-1.75-1.232-4.571-2.286-5.732a28.918 28.918 0 01-1.911-2.268c-.536-.696-1.75-2.304-2.446-2.768H2.286A2.279 2.279 0 010 18.286V6.857a2.279 2.279 0 012.286-2.286h5.143c.5 0 1.946-.536 2.464-.714 2.571-.893 4.804-1.571 7.554-1.571h2c3.25 0 5.589 1.929 5.571 5.268v.089c.696.893 1.071 2.036 1.071 3.179 0 .25-.018.518-.054.768a5.23 5.23 0 01.679 2.571c0 .411-.054.839-.161 1.232a5.26 5.26 0 01.875 2.911z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ThumbsODown);
var _default = ForwardRef;
exports["default"] = _default;