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

function Mercury(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 21 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14.821 5.643c3.393 1.679 5.75 5.179 5.75 9.214 0 5.286-4 9.643-9.143 10.214v2.357h1.714c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571h-1.714v1.714c0 .321-.25.571-.571.571H9.714a.564.564 0 01-.571-.571v-1.714H7.429a.564.564 0 01-.571-.571v-1.143c0-.321.25-.571.571-.571h1.714v-2.357C4 24.5 0 20.142 0 14.857c0-4.036 2.357-7.536 5.75-9.214A9.206 9.206 0 011.679.768.57.57 0 012.215 0h1.232a.56.56 0 01.518.357 6.849 6.849 0 0012.642 0c.089-.214.286-.357.661-.357h1.089a.57.57 0 01.536.768 9.206 9.206 0 01-4.071 4.875zm-4.535 17.214c4.411 0 8-3.589 8-8s-3.589-8-8-8-8 3.589-8 8 3.589 8 8 8z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Mercury);
var _default = ForwardRef;
exports["default"] = _default;