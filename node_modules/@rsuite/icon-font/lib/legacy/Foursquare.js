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

function Foursquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 23 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.857 7.75l.661-3.464a.82.82 0 00-.786-1.018H5.018c-.571 0-.964.518-.964.964v19.661c0 .054.054.071.107.018 4.679-5.625 5.196-6.286 5.196-6.286.536-.625.75-.732 1.536-.732h4.268c.589 0 .929-.5.982-.786s.554-2.893.661-3.411-.375-1.054-.857-1.054h-5.25c-.696 0-1.196-.5-1.196-1.196v-.75c0-.696.5-1.179 1.196-1.179h6.179c.429 0 .911-.393.982-.768zm4.054-3.964C21.25 7 19.268 17.161 19.09 17.893c-.214.839-.536 2.304-2.571 2.304H11.68c-.196 0-.214-.018-.393.179 0 0-.125.143-7.607 8.821-.589.679-1.554.554-1.911.411s-.982-.571-.982-1.75V2.679C.787 1.643 1.43 0 3.608 0h15.857c2.321 0 2.946 1.321 2.446 3.786zm0 0L19.09 17.893c.179-.732 2.161-10.893 2.821-14.107z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Foursquare);
var _default = ForwardRef;
exports["default"] = _default;