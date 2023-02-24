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

function EventDetail(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.5 2a1.5 1.5 0 011.493 1.356L14 3.5V7a.5.5 0 01-.992.09L13 7V3.5a.5.5 0 00-.41-.492L12.5 3h-11a.5.5 0 00-.492.41L1 3.5v9a.5.5 0 00.41.492L1.5 13H5a.5.5 0 01.09.992L5 14H1.5a1.5 1.5 0 01-1.493-1.356L0 12.5v-9a1.5 1.5 0 011.356-1.493L1.5 2h11z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3.5 0a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zM10.5 9h5a.5.5 0 010 1h-5a.5.5 0 010-1zM8.5 9h-1a.5.5 0 000 1h1a.5.5 0 000-1zM8.5 12h-1a.5.5 0 000 1h1a.5.5 0 000-1zM8.5 15h-1a.5.5 0 000 1h1a.5.5 0 000-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M.5 4h13a.5.5 0 010 1H.5a.5.5 0 010-1zM10.5 12h5a.5.5 0 010 1h-5a.5.5 0 010-1zM10.5 15h3a.5.5 0 010 1h-3a.5.5 0 010-1zM3.5 8h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.5 0a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(EventDetail);
var _default = ForwardRef;
exports["default"] = _default;