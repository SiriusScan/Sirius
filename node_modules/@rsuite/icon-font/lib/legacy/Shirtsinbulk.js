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

function Shirtsinbulk(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M0 0h27.429v24.857l-13.857 6.036L.001 24.857V0zm25.643 23.696V7.16H1.786v16.536l11.804 5.25zm0-18.321V1.786H1.786v3.589h23.857zM3.232 10.696v2.054h-.661v-2.054h.661zm0 2.643v2.054h-.661v-2.054h.661zm0 2.643v2.054h-.661v-2.054h.661zm0 2.643v2.054h-.661v-2.054h.661zm0 2.643v2.054h-.661v-2.054h.661zm.464 2.553l.268-.607 1.875.839-.268.589zm2.429 1.072l.268-.607 1.875.821-.268.607zm2.411 1.071l.268-.607 1.875.821-.268.607zm2.428 1.054l.268-.589 1.857.821-.268.607zm3.268.232l1.875-.821.268.589-1.875.839zm2.411-1.071l1.875-.821.268.607-1.875.821zm2.428-1.072l1.875-.821.268.607-1.875.821zm2.411-1.053l1.875-.839.268.607-1.875.821zM4.625 2.625v.643H2.589v-.643h2.036zm2.893 0v.643H5.464v-.643h2.054zm2.893 0v.643H8.357v-.643h2.054zm2.875 0v.643H11.25v-.643h2.036zm2.893 0v.643h-2.036v-.643h2.036zm2.892 0v.643h-2.054v-.643h2.054zm2.893 0v.643H19.91v-.643h2.054zm2.875 0v.643h-2.036v-.643h2.036zM3.232 8.696v1.411h-.661V8.053h2.054v.643H3.232zm4.286-.642v.643H5.464v-.643h2.054zm2.893 0v.643H8.357v-.643h2.054zm2.875 0v.643H11.25v-.643h2.036zm2.893 0v.643h-2.036v-.643h2.036zm2.892 0v.643h-2.054v-.643h2.054zm2.893 0v.643H19.91v-.643h2.054zm2.232 2.053V8.696h-1.393v-.643h2.054v2.054h-.661zm0 2.643v-2.054h.661v2.054h-.661zm0 2.643v-2.054h.661v2.054h-.661zm0 2.643v-2.054h.661v2.054h-.661zm0 2.643v-2.054h.661v2.054h-.661zm0 2.642v-2.054h.661v2.054h-.661zm-10.625-.625a5.598 5.598 0 01-5.589-5.589c0-3.071 2.518-5.589 5.589-5.589a5.598 5.598 0 015.589 5.589c0 3.089-2.5 5.589-5.589 5.589zm-2.946-6.803c0 2.714 4.75.732 4.75 2.321 0 .804-1.464.875-2 .875-.75 0-1.821-.161-2.196-.911h-.054l-.554 1.125c.911.571 1.786.75 2.893.75 1.196 0 3.125-.357 3.125-1.911 0-2.946-4.804-1-4.804-2.321 0-.804 1.268-.911 1.821-.911.661 0 1.786.196 2.179.804h.054l.536-1.036c-.929-.375-1.679-.732-2.714-.732-1.232 0-3.036.393-3.036 1.946z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Shirtsinbulk);
var _default = ForwardRef;
exports["default"] = _default;