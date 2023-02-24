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

function VenusDouble(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M31.964 9.446c.446 5.661-3.696 10.464-9.107 11.054v4.643h4c.321 0 .571.25.571.571v1.143c0 .321-.25.571-.571.571h-4v4c0 .321-.25.571-.571.571h-1.143a.564.564 0 01-.571-.571v-4h-9.143v4c0 .321-.25.571-.571.571H9.715a.564.564 0 01-.571-.571v-4h-4a.564.564 0 01-.571-.571v-1.143c0-.321.25-.571.571-.571h4V20.5C3.733 19.911-.41 15.107.037 9.446.43 4.535 4.376.517 9.269.053c2.5-.25 4.839.411 6.732 1.679A10.205 10.205 0 0122.733.053c4.893.464 8.839 4.482 9.232 9.393zM16 15.875a7.972 7.972 0 000-11.178 7.972 7.972 0 000 11.178zm-5.714 2.411a8.002 8.002 0 003.893-1.018c-1.714-1.839-2.75-4.286-2.75-6.982s1.054-5.143 2.75-6.982a8.002 8.002 0 00-3.893-1.018c-4.411 0-8 3.589-8 8s3.589 8 8 8zm10.285 6.857V20.5A10.184 10.184 0 0116 18.821a10.189 10.189 0 01-4.571 1.679v4.643h9.143zm1.143-6.857c4.411 0 8-3.589 8-8s-3.589-8-8-8a8.002 8.002 0 00-3.893 1.018c1.696 1.839 2.75 4.286 2.75 6.982s-1.036 5.143-2.75 6.982a8.002 8.002 0 003.893 1.018z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(VenusDouble);
var _default = ForwardRef;
exports["default"] = _default;