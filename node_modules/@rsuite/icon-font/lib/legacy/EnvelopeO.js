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

function EnvelopeO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M29.714 26.857V13.143a9.675 9.675 0 01-1.232 1.179c-2.554 1.964-5.125 3.964-7.607 6.036-1.339 1.125-3 2.5-4.857 2.5h-.036c-1.857 0-3.518-1.375-4.857-2.5-2.482-2.071-5.054-4.071-7.607-6.036a9.606 9.606 0 01-1.232-1.179v13.714c0 .304.268.571.571.571h26.286a.587.587 0 00.571-.571zm0-18.768c0-.446.107-1.232-.571-1.232H2.857a.587.587 0 00-.571.571c0 2.036 1.018 3.804 2.625 5.071 2.393 1.875 4.786 3.768 7.161 5.661.946.768 2.661 2.411 3.911 2.411h.036c1.25 0 2.964-1.643 3.911-2.411 2.375-1.893 4.768-3.786 7.161-5.661 1.161-.911 2.625-2.893 2.625-4.411zM32 7.429v19.429a2.866 2.866 0 01-2.857 2.857H2.857A2.866 2.866 0 010 26.858V7.429a2.866 2.866 0 012.857-2.857h26.286A2.866 2.866 0 0132 7.429z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(EnvelopeO);
var _default = ForwardRef;
exports["default"] = _default;