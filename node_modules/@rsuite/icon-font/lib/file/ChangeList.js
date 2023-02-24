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

function ChangeList(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.5 0A2.5 2.5 0 0114 2.5v11.792l1.146-1.146a.5.5 0 01.638-.058l.069.058a.5.5 0 010 .707l-2 2-.012.012c-.012.011-.025.023-.039.033a.758.758 0 01-.07.045.389.389 0 01-.042.019l-.039.014a.39.39 0 01-.046.012l-.033.006-.052.005h-.041a.436.436 0 01-.052-.005l.072.005a.52.52 0 01-.191-.038l-.041-.019a.471.471 0 01-.122-.089l.051.045a.31.31 0 01-.039-.033l-.012-.012-2-2a.5.5 0 01.707-.707l1.146 1.146V2.5a1.5 1.5 0 00-1.5-1.5h-4.5a.5.5 0 010-1h4.5zm-9 0h.012a.42.42 0 01.062.005L2.5 0a.52.52 0 01.191.038l.041.019a.471.471 0 01.122.089L2.803.101a.31.31 0 01.039.033l.012.012 2 2a.5.5 0 01-.707.707L3.001 1.707v11.792a1.5 1.5 0 001.5 1.5h4.5a.5.5 0 010 1h-4.5a2.5 2.5 0 01-2.5-2.5V1.705L.855 2.853a.5.5 0 01-.638.058l-.069-.058a.5.5 0 010-.707l2-2L2.16.134c.012-.011.025-.023.039-.033a.758.758 0 01.07-.045.389.389 0 01.042-.019L2.35.023a.39.39 0 01.077-.018A.46.46 0 012.491 0h.011z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.5 5h5a.5.5 0 010 1h-5a.5.5 0 010-1zM5.5 8h5a.5.5 0 010 1h-5a.5.5 0 010-1zM5.5 11h3a.5.5 0 010 1h-3a.5.5 0 010-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(ChangeList);
var _default = ForwardRef;
exports["default"] = _default;