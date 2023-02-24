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

function Expeditedssl(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 1.143C7.804 1.143 1.143 7.804 1.143 16S7.804 30.857 16 30.857 30.857 24.196 30.857 16 24.196 1.143 16 1.143zM16 0c8.839 0 16 7.161 16 16s-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0zM8.857 14.857c.161 0 .286.125.286.286v8.571a.282.282 0 01-.286.286h-.571A.282.282 0 018 23.714v-8.571c0-.161.125-.286.286-.286h.571zM16 16a2.279 2.279 0 012.286 2.286c0 .839-.464 1.571-1.143 1.964v2.036c0 .321-.25.571-.571.571h-1.143a.564.564 0 01-.571-.571V20.25a2.274 2.274 0 01-1.143-1.964A2.279 2.279 0 0116.001 16zm0-13.714c7.571 0 13.714 6.143 13.714 13.714S23.571 29.714 16 29.714 2.286 23.571 2.286 16 8.429 2.286 16 2.286zm-6.286 8.571v1.714c0 .321.25.571.571.571h1.143c.321 0 .571-.25.571-.571v-1.714c0-2.214 1.786-4 4-4s4 1.786 4 4v1.714c0 .321.25.571.571.571h1.143c.321 0 .571-.25.571-.571v-1.714c0-3.464-2.821-6.286-6.286-6.286s-6.286 2.821-6.286 6.286zM25.143 24v-9.143c0-.625-.518-1.143-1.143-1.143H8c-.625 0-1.143.518-1.143 1.143V24c0 .625.518 1.143 1.143 1.143h16c.625 0 1.143-.518 1.143-1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Expeditedssl);
var _default = ForwardRef;
exports["default"] = _default;