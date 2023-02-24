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

function DeviceOther(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M15 5a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1V6a1 1 0 011-1h4zm0 1h-4v8h4V6zM4.586 13.586a2 2 0 01-.578-1.238L4 12.172v-.343c0-.472.166-.926.467-1.284l.119-.13.414-.414v-.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v.5l.414.414a2 2 0 01.578 1.238l.008.176v.343c0 .472-.166.926-.467 1.284l-.119.13L8 14v.5a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5V14l-.414-.414zm3-2.586H5.413l-.12.121a1.002 1.002 0 00-.284.576L5 11.828v.343a1 1 0 00.206.608l.087.099.121.121h2.171l.122-.121c.156-.156.255-.359.284-.576L8 12.171v-.343a1 1 0 00-.206-.608l-.087-.099L7.586 11z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14.5 2a.5.5 0 01.09.992L14.5 3h-13a.5.5 0 00-.492.41L1 3.5v9a.5.5 0 00.41.492L1.5 13H3a.5.5 0 01.09.992L3 14H1.5a1.5 1.5 0 01-1.493-1.356L0 12.5v-9a1.5 1.5 0 011.356-1.493L1.5 2h13z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(DeviceOther);
var _default = ForwardRef;
exports["default"] = _default;