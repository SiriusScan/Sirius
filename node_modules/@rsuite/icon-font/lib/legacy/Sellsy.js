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

function Sellsy(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.786 24.482V11.393c0-.5-.411-.911-.893-.911h-1.661a.911.911 0 00-.893.911v13.089c0 .482.411.893.893.893h1.661a.908.908 0 00.893-.893zm-5.072 0V15a.908.908 0 00-.893-.893h-1.804a.908.908 0 00-.893.893v9.482c0 .482.411.893.893.893h1.804a.908.908 0 00.893-.893zm-5.214 0v-7.661a.908.908 0 00-.893-.893h-1.804a.908.908 0 00-.893.893v7.661c0 .482.411.893.893.893h1.804a.908.908 0 00.893-.893zm-5.214 0v-6.464a.908.908 0 00-.893-.893H8.589a.908.908 0 00-.893.893v6.464c0 .482.411.893.893.893h1.804a.908.908 0 00.893-.893zm25.285-2.607c0 3.964-3.232 7.179-7.179 7.179H7.178c-3.946 0-7.179-3.214-7.179-7.179a7.197 7.197 0 014.125-6.482 4.686 4.686 0 01-.179-1.304 4.9 4.9 0 014.893-4.893c1.179 0 2.321.429 3.214 1.196a9.799 9.799 0 019.5-7.446c5.393 0 9.786 4.393 9.786 9.786 0 .732-.071 1.464-.25 2.179 3.214.786 5.482 3.679 5.482 6.964z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Sellsy);
var _default = ForwardRef;
exports["default"] = _default;