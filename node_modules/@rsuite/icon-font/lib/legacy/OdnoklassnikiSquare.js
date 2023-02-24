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

function OdnoklassnikiSquare(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.554 10.357c0 1.571-1.268 2.839-2.839 2.839s-2.839-1.268-2.839-2.839 1.268-2.839 2.839-2.839 2.839 1.268 2.839 2.839zm3.821 6.482c-.321-.643-1.232-1.196-2.429-.25 0 0-1.625 1.286-4.232 1.286s-4.232-1.286-4.232-1.286c-1.196-.946-2.107-.393-2.429.25-.571 1.143.071 1.696 1.518 2.643 1.232.786 2.946 1.089 4.036 1.196l-.911.929C10.41 22.893 9.16 24.143 8.285 25a1.325 1.325 0 000 1.875l.161.161a1.325 1.325 0 001.875 0l3.411-3.411a302.002 302.002 0 003.411 3.411 1.325 1.325 0 001.875 0l.161-.161a1.325 1.325 0 000-1.875l-3.411-3.393-.929-.929c1.107-.107 2.786-.411 4.018-1.196 1.446-.946 2.089-1.5 1.518-2.643zm-.875-6.482c0-3.196-2.589-5.786-5.786-5.786S7.928 7.16 7.928 10.357s2.589 5.786 5.786 5.786 5.786-2.589 5.786-5.786zm7.929-2.928v17.143a5.145 5.145 0 01-5.143 5.143H5.143A5.145 5.145 0 010 24.572V7.429a5.145 5.145 0 015.143-5.143h17.143a5.145 5.145 0 015.143 5.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(OdnoklassnikiSquare);
var _default = ForwardRef;
exports["default"] = _default;