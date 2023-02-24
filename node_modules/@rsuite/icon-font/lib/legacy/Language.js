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

function Language(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.679 19.25c-.036.125-.911-.286-1.143-.375-.232-.107-1.286-.696-1.554-.875s-1.286-1.018-1.411-1.071a32.396 32.396 0 01-2.393 3.232c-.321.375-1.286 1.589-1.875 1.964-.089.054-.607.107-.679.071.286-.214 1.107-1.232 1.464-1.643.446-.518 2.571-3.482 2.929-4.161.375-.679 1.5-2.929 1.554-3.143-.179-.018-1.589.464-1.964.589-.357.107-1.339.339-1.411.393-.071.071-.018.286-.054.357s-.357.232-.554.268a1.893 1.893 0 01-.839 0c-.232-.054-.446-.286-.5-.375 0 0-.071-.107-.089-.411.214-.071.571-.089.964-.196s1.357-.393 1.875-.571 1.518-.554 1.821-.625c.321-.054 1.125-.589 1.554-.732s.732-.321.75-.232 0 .482-.018.589c-.018.089-.875 1.768-1 2.036a29.98 29.98 0 01-1.375 2.339c.286.125.893.375 1.143.5.304.143 2.429 1.036 2.536 1.071s.304.857.268 1zm-3.661-8.679c.054.304-.036.429-.071.5-.179.339-.625.571-.893.679s-.714.214-1.071.214c-.161-.018-.482-.071-.875-.464-.214-.232-.375-.857-.304-.786s.589.143.821.089.786-.214 1.036-.286c.268-.089.804-.232.982-.25.179 0 .321.071.375.304zm12.464 2.304l1.125 4.054-2.482-.75zM.696 27.161l12.393-4.143V4.589L.696 8.75v18.411zM22.857 21.5l1.821.554-3.232-11.732-1.786-.554-3.857 9.571 1.821.554.804-1.964 3.768 1.161zM13.875 4.321l10.232 3.286V.821zm5.554 23.625l2.821.232-.964 2.857-.714-1.179c-1.446.929-3.232 1.643-4.929 1.929-.518.107-1.107.214-1.625.214h-1.5c-1.893 0-5.339-1.125-6.839-2.214-.107-.089-.143-.161-.143-.286 0-.196.143-.339.321-.339.161 0 1 .518 1.232.625 1.607.804 3.857 1.536 5.661 1.536 2.232 0 3.75-.286 5.786-1.161.589-.268 1.107-.607 1.661-.911zm8-19.267v19.268c-13.804-4.393-13.821-4.393-13.821-4.393C13.322 23.679.519 28 .34 28a.342.342 0 01-.321-.232c0-.018-.018-.036-.018-.054V8.464c.018-.054.036-.143.071-.179.107-.125.25-.161.357-.196.054-.018 1.143-.375 2.661-.893V.339l9.964 3.536C13.179 3.839 24.286 0 24.447 0c.196 0 .357.143.357.375v7.464z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Language);
var _default = ForwardRef;
exports["default"] = _default;