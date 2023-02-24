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

function Instagram(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 16c0-2.518-2.054-4.571-4.571-4.571S9.144 13.483 9.144 16s2.054 4.571 4.571 4.571 4.571-2.054 4.571-4.571zm2.464 0c0 3.893-3.143 7.036-7.036 7.036S6.678 19.893 6.678 16s3.143-7.036 7.036-7.036S20.75 12.107 20.75 16zm1.929-7.321c0 .911-.732 1.643-1.643 1.643s-1.643-.732-1.643-1.643.732-1.643 1.643-1.643 1.643.732 1.643 1.643zM13.714 4.75c-2 0-6.286-.161-8.089.554-.625.25-1.089.554-1.571 1.036s-.786.946-1.036 1.571C2.304 9.715 2.464 14 2.464 16s-.161 6.286.554 8.089c.25.625.554 1.089 1.036 1.571s.946.786 1.571 1.036c1.804.714 6.089.554 8.089.554s6.286.161 8.089-.554c.625-.25 1.089-.554 1.571-1.036s.786-.946 1.036-1.571c.714-1.804.554-6.089.554-8.089s.161-6.286-.554-8.089c-.25-.625-.554-1.089-1.036-1.571s-.946-.786-1.571-1.036c-1.804-.714-6.089-.554-8.089-.554zM27.429 16c0 1.893.018 3.768-.089 5.661-.107 2.196-.607 4.143-2.214 5.75s-3.554 2.107-5.75 2.214c-1.893.107-3.768.089-5.661.089s-3.768.018-5.661-.089c-2.196-.107-4.143-.607-5.75-2.214S.197 23.857.09 21.661C-.017 19.768.001 17.893.001 16s-.018-3.768.089-5.661c.107-2.196.607-4.143 2.214-5.75s3.554-2.107 5.75-2.214c1.893-.107 3.768-.089 5.661-.089s3.768-.018 5.661.089c2.196.107 4.143.607 5.75 2.214s2.107 3.554 2.214 5.75c.107 1.893.089 3.768.089 5.661z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Instagram);
var _default = ForwardRef;
exports["default"] = _default;