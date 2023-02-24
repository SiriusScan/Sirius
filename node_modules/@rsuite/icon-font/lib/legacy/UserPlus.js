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

function UserPlus(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.571 16c-3.786 0-6.857-3.071-6.857-6.857s3.071-6.857 6.857-6.857 6.857 3.071 6.857 6.857S16.357 16 12.571 16zm17.143 2.286H36c.304 0 .571.268.571.571v3.429a.587.587 0 01-.571.571h-6.286v6.286a.587.587 0 01-.571.571h-3.429a.587.587 0 01-.571-.571v-6.286h-6.286a.587.587 0 01-.571-.571v-3.429c0-.304.268-.571.571-.571h6.286V12c0-.304.268-.571.571-.571h3.429c.304 0 .571.268.571.571v6.286zm-13.143 4a2.302 2.302 0 002.286 2.286h4.571v4.25c-.875.643-1.982.893-3.054.893H4.767c-2.857 0-4.768-1.714-4.768-4.625 0-4.036.946-10.232 6.179-10.232.286 0 .482.125.696.304 1.75 1.339 3.446 2.179 5.696 2.179s3.946-.839 5.696-2.179c.214-.179.411-.304.696-.304 1.518 0 2.857.571 3.875 1.714h-3.982a2.302 2.302 0 00-2.286 2.286v3.429z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserPlus);
var _default = ForwardRef;
exports["default"] = _default;