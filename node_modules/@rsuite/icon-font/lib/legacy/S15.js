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

function S15(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.714 19.429v3.429c0 2.036-.893 3.839-2.286 5.107v3.464c0 .321-.25.571-.571.571h-1.143a.564.564 0 01-.571-.571v-2.107a6.902 6.902 0 01-2.286.393H9.143a6.907 6.907 0 01-2.286-.393v1.964c0 .393-.25.714-.571.714H5.143c-.321 0-.571-.321-.571-.714v-3.321c-1.393-1.268-2.286-3.071-2.286-5.107v-3.429h27.429zM12.571 12c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm1.143-1.143c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm-1.143-1.143c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm2.286 0c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm-1.143-1.143c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm-1.143-1.142c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zM32 16.571v1.143c0 .321-.25.571-.571.571H.572a.564.564 0 01-.571-.571v-1.143c0-.321.25-.571.571-.571h1.714V4.571A4.58 4.58 0 016.857 0c1.286 0 2.446.536 3.286 1.393a3.472 3.472 0 013.411.482l.393-.393a.28.28 0 01.393 0l.75.75a.28.28 0 010 .393L9.483 8.232a.28.28 0 01-.393 0l-.75-.75a.28.28 0 010-.393l.393-.393a3.447 3.447 0 01-.304-3.786 2.259 2.259 0 00-1.571-.625 2.279 2.279 0 00-2.286 2.286V16h26.857c.321 0 .571.25.571.571zm-16-8c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm-1.143-1.142c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm-1.143-1.143c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm3.429 1.143c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zM16 6.286c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm-1.143-1.143c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm3.429 1.143c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm-1.143-1.143c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571zm2.286 0c0 .321-.25.571-.571.571s-.571-.25-.571-.571.25-.571.571-.571.571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(S15);
var _default = ForwardRef;
exports["default"] = _default;