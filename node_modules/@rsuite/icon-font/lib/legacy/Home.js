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

function Home(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M25.143 17.714v8.571c0 .625-.518 1.143-1.143 1.143h-6.857v-6.857h-4.571v6.857H5.715a1.151 1.151 0 01-1.143-1.143v-8.571c0-.036.018-.071.018-.107l10.268-8.464 10.268 8.464c.018.036.018.071.018.107zm3.982-1.232l-1.107 1.321a.59.59 0 01-.375.196h-.054a.561.561 0 01-.375-.125L14.857 7.57 2.5 17.874a.611.611 0 01-.429.125.594.594 0 01-.375-.196L.589 16.482a.586.586 0 01.071-.804L13.499 4.982c.75-.625 1.964-.625 2.714 0l4.357 3.643V5.143c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571v7.286l3.911 3.25a.585.585 0 01.071.804z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Home);
var _default = ForwardRef;
exports["default"] = _default;