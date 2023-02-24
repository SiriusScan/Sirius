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

function Krw(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.179 21.339L10.625 16H7.786l1.339 5.357c.018.036.018.071.036.107 0-.036.018-.089.018-.125zm2.071-7.625l.625-2.286H6.661l.571 2.286h4.018zm3.429 0h2.482l-.625-2.286h-1.25zm8.017 7.643L24.089 16h-2.893l1.446 5.339c.018.054.018.089.036.125 0-.036.018-.071.018-.107zm1.983-7.643l.589-2.286h-5.304l.607 2.286h4.107zm7.321.572v1.143c0 .321-.25.571-.571.571h-3.804l-2.929 11a.59.59 0 01-.554.429h-2.839a.591.591 0 01-.554-.429l-2.964-11h-3.732l-2.982 11a.574.574 0 01-.554.429H7.678A.554.554 0 017.142 27L4.285 16H.571A.564.564 0 010 15.429v-1.143c0-.321.25-.571.571-.571h3.125l-.589-2.286H.571A.564.564 0 010 10.858V9.715c0-.321.25-.571.571-.571h1.946L.928 3.001a.552.552 0 01.089-.5.634.634 0 01.464-.214h2.446c.268 0 .5.179.554.429l1.607 6.429h6.411l1.732-6.429a.59.59 0 01.554-.429h2.25c.268 0 .482.179.554.429l1.75 6.429h6.518l1.661-6.429a.56.56 0 01.554-.429h2.446c.179 0 .357.089.464.214a.562.562 0 01.089.5l-1.625 6.143h1.982c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571h-2.589l-.607 2.286h3.196c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Krw);
var _default = ForwardRef;
exports["default"] = _default;