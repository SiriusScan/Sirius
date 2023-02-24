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

function CloseCircle(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M23.936 20.711c0-.363-.133-.672-.393-.937L19.769 16l3.771-3.769a1.28 1.28 0 00.393-.937c0-.377-.133-.695-.393-.958l-1.877-1.874a1.312 1.312 0 00-.962-.395c-.361 0-.67.133-.937.395l-3.765 3.769L12.23 8.46a1.293 1.293 0 00-.939-.395c-.375 0-.697.133-.958.395l-1.874 1.874a1.312 1.312 0 00-.395.958c0 .361.133.67.395.937L12.23 16l-3.771 3.771a1.278 1.278 0 00-.395.937c0 .375.133.695.395.96l1.874 1.874c.263.263.583.393.958.393.361 0 .672-.13.937-.393l3.771-3.771 3.769 3.771c.265.263.576.393.937.393.377 0 .697-.13.962-.393l1.877-1.874c.258-.265.391-.587.391-.958zM32 16c0 2.903-.715 5.579-2.144 8.03a15.931 15.931 0 01-5.822 5.826c-2.457 1.429-5.131 2.142-8.034 2.142s-5.579-.711-8.034-2.142a15.924 15.924 0 01-5.822-5.826C.715 21.58 0 18.903 0 16s.715-5.579 2.146-8.032 3.369-4.393 5.822-5.822S13.097.002 16 .002s5.577.715 8.034 2.146a15.928 15.928 0 015.822 5.822C31.282 10.42 32 13.097 32 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CloseCircle);
var _default = ForwardRef;
exports["default"] = _default;