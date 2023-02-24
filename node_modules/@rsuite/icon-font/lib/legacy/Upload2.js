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

function Upload2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M24.615 27.691c0-.336-.121-.624-.368-.866-.242-.247-.528-.368-.864-.368s-.626.121-.869.368a1.183 1.183 0 00-.368.866c0 .334.126.626.368.866s.533.366.869.366.622-.121.864-.366c.247-.247.368-.535.368-.866zm4.921 0c0-.336-.121-.624-.368-.866a1.17 1.17 0 00-.864-.368c-.336 0-.622.121-.864.368a1.164 1.164 0 00-.368.866c0 .334.121.626.368.866.242.24.528.366.864.366.331 0 .622-.121.864-.366.251-.247.368-.535.368-.866zM32 23.383v6.149c0 .512-.181.949-.539 1.305a1.772 1.772 0 01-1.303.539H1.847c-.517 0-.949-.181-1.307-.539a1.765 1.765 0 01-.539-1.303v-6.149c0-.517.181-.951.539-1.307a1.774 1.774 0 011.307-.539h8.208c.272.72.722 1.307 1.358 1.771a3.562 3.562 0 002.126.693h4.921c.782 0 1.493-.231 2.126-.693a3.778 3.778 0 001.355-1.771h8.21c.512 0 .949.181 1.307.539.359.357.542.791.542 1.305zm-6.249-12.457c-.222.512-.599.768-1.136.768h-4.921v8.615c0 .331-.126.624-.368.869s-.535.366-.869.366h-4.919c-.331 0-.622-.126-.869-.366a1.177 1.177 0 01-.363-.869v-8.615H7.385c-.535 0-.917-.256-1.131-.768-.219-.501-.133-.942.265-1.328L15.136.985c.229-.242.519-.363.864-.363.347 0 .635.121.869.366l8.615 8.613c.395.384.485.825.267 1.326z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Upload2);
var _default = ForwardRef;
exports["default"] = _default;