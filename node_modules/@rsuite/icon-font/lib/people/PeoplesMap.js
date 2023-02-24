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

function PeoplesMap(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.5 9a1.5 1.5 0 10-.001-3.001A1.5 1.5 0 0012.5 9zm0 1a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12.5 10a2.5 2.5 0 00-2.5 2.5V15h5v-2.5a2.5 2.5 0 00-2.5-2.5zm0-1a3.5 3.5 0 013.5 3.5V15a1 1 0 01-1 1h-5a1 1 0 01-1-1v-2.5A3.5 3.5 0 0112.5 9zM5 16a1 1 0 01-.993-.883L4 15v-2a3 3 0 012.824-2.995L7 10v1a2.001 2.001 0 00-1.995 1.851L5 13v2h1.5a.5.5 0 010 1H5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 10a1 1 0 100-2 1 1 0 000 2zm0 1a2 2 0 11-.001-3.999A2 2 0 017 11z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M11 0c1.054 0 1.918.816 1.995 1.851L13 2v.5a.5.5 0 01-.992.09L12 2.5V2a1 1 0 00-.883-.993L11 1H2a1 1 0 00-.993.883L1 2v10a1 1 0 00.883.993L2 13h.5a.5.5 0 01.09.992L2.5 14H2a2.001 2.001 0 01-1.995-1.851L0 12V2C0 .946.816.082 1.851.005L2 0h9z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PeoplesMap);
var _default = ForwardRef;
exports["default"] = _default;