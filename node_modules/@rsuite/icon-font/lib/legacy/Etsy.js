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

function Etsy(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.25 3.268v11.696c4.143.036 6.321-.179 6.321-.179 1.679-.054 1.929-.482 2.321-2.125l.589-2.536h1.839l-.25 5.75.125 5.696h-1.839l-.518-2.268c-.375-1.696-1.107-2.107-2.304-2.125 0 0-1.536-.143-6.286-.143v9.929c0 1.857 1.018 2.732 3.161 2.732h6.375c2.143 0 4.071-.214 5.393-3.268l1.661-3.857h1.589c-.125.768-.982 7.857-1.107 9.429-5.875-.214-8.393-.214-8.393-.214H6.713l-6.714.214v-1.821l2.268-.446c1.589-.304 2.071-.768 2.089-2.071.107-4.321.143-11.482.143-11.482S4.553 9 4.356 4.661c-.054-1.482-.5-1.839-2.089-2.143l-2.268-.429V.268l6.714.214h12.536s2.482 0 6.679-.482c-.25 2.732-.554 9.036-.554 9.036h-1.661l-.571-2.214c-.696-2.768-1.625-4.25-3.339-4.25h-9.786c-.732 0-.768.25-.768.696z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Etsy);
var _default = ForwardRef;
exports["default"] = _default;