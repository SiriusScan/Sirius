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

function Meanpath(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M23.411 15.036v2.036c0 .571-.339.929-.911.929h-3.607c-.571 0-.929-.357-.929-.929v-2.036c0-.571.357-.929.929-.929H22.5c.571 0 .911.357.911.929zm-8.75 4.107v-4.464c0-1.268-.839-2.107-2.107-2.107h-2.375c-.804 0-1.393.339-1.714.929-.321-.589-.911-.929-1.714-.929H4.43c-1.25 0-2.107.839-2.107 2.107v4.464c0 .268.125.393.375.393h.982c.268 0 .393-.125.393-.393v-4.107c0-.571.339-.929.929-.929h1.679c.571 0 .929.357.929.929v4.107c0 .268.107.393.375.393h.964c.268 0 .393-.125.393-.393v-4.107c0-.571.357-.929.929-.929h1.732c.571 0 .911.357.911.929v4.107c0 .268.125.393.393.393h.982c.25 0 .375-.125.375-.393zm10.518-1.714v-2.75c0-1.268-.857-2.107-2.125-2.107H18.34c-1.268 0-2.125.839-2.125 2.107V22c0 .268.143.375.393.375h.982c.268 0 .375-.107.375-.375v-3.214c.339.464.875.75 1.679.75h3.411c1.268 0 2.125-.857 2.125-2.107zm2.25-11v19.143a4.146 4.146 0 01-4.143 4.143H4.143A4.146 4.146 0 010 25.572V6.429a4.146 4.146 0 014.143-4.143h19.143a4.146 4.146 0 014.143 4.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Meanpath);
var _default = ForwardRef;
exports["default"] = _default;