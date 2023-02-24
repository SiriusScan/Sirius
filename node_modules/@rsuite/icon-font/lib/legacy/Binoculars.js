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

function Binoculars(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.571 5.714v13.714c0 .625-.518 1.143-1.143 1.143v10.286c0 .625-.518 1.143-1.143 1.143H1.142a1.151 1.151 0 01-1.143-1.143v-9.143L4.445 6.125a.574.574 0 01.554-.411h7.571zm5.715 0v12.571h-4.571V5.714h4.571zm13.714 16v9.143c0 .625-.518 1.143-1.143 1.143h-9.143a1.151 1.151 0 01-1.143-1.143V20.571a1.151 1.151 0 01-1.143-1.143V5.714h7.571c.25 0 .482.161.554.411zM13.143.571v4H6.857v-4c0-.321.25-.571.571-.571h5.143c.321 0 .571.25.571.571zm12 0v4h-6.286v-4c0-.321.25-.571.571-.571h5.143c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Binoculars);
var _default = ForwardRef;
exports["default"] = _default;