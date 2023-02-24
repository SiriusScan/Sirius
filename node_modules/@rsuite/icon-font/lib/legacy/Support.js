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

function Support(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 0c8.839 0 16 7.161 16 16s-7.161 16-16 16S0 24.839 0 16 7.161 0 16 0zm0 2.286c-2.321 0-4.518.589-6.446 1.607l3.464 3.464a9.255 9.255 0 012.982-.5c1.054 0 2.036.179 2.982.5l3.464-3.464A13.789 13.789 0 0016 2.286zM3.893 22.446l3.464-3.464a9.255 9.255 0 01-.5-2.982c0-1.054.179-2.036.5-2.982L3.893 9.554C2.875 11.483 2.286 13.679 2.286 16s.589 4.518 1.607 6.446zM16 29.714c2.321 0 4.518-.589 6.446-1.607l-3.464-3.464c-.946.321-1.929.5-2.982.5a9.255 9.255 0 01-2.982-.5l-3.464 3.464A13.789 13.789 0 0016 29.714zm0-6.857c3.786 0 6.857-3.071 6.857-6.857S19.786 9.143 16 9.143 9.143 12.214 9.143 16s3.071 6.857 6.857 6.857zm8.643-3.875l3.464 3.464c1.018-1.929 1.607-4.125 1.607-6.446s-.589-4.518-1.607-6.446l-3.464 3.464c.321.946.5 1.946.5 2.982s-.179 2.036-.5 2.982z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Support);
var _default = ForwardRef;
exports["default"] = _default;