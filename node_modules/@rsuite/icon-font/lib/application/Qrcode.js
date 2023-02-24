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

function Qrcode(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M6 1a1 1 0 011 1v4a1 1 0 01-1 1H2a1 1 0 01-1-1V3a2 2 0 012-2h3zm0 1H3a1 1 0 00-.993.883L2 3v3h4V2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 3a1 1 0 110 2 1 1 0 010-2zM13 1a2 2 0 012 2v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V2a1 1 0 011-1h3zm0 1h-3v4h4V3a1 1 0 00-1-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3a1 1 0 110 2 1 1 0 010-2zM6 9a1 1 0 011 1v4a1 1 0 01-1 1H3a2 2 0 01-2-2v-3a1 1 0 011-1h4zm0 1H2v3a1 1 0 00.883.993L3 14h3v-4z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 11a1 1 0 110 2 1 1 0 010-2zM10.5 8h.012a.42.42 0 01.062.005L10.5 8a.52.52 0 01.191.038l.041.019a.397.397 0 01.07.044.31.31 0 01.039.033l.012.012.98.977a.51.51 0 01.169.334v.089a.5.5 0 01-.145.311l-.026.02-.978.98a.489.489 0 01-.177.114l1.03 1.028h.793a.5.5 0 010 1L11.49 13a.582.582 0 01-.073-.007l.083.006a.504.504 0 01-.157-.024l-.031-.012a.31.31 0 01-.077-.04l-.038-.026c-.012-.009-.025-.021-.037-.032l-.012-.012-2.013-2.013a.4.4 0 01-.033-.039l.045.051a.471.471 0 01-.108-.164l-.014-.039a.39.39 0 01-.018-.077.446.446 0 01-.005-.063v-.023c0-.021.002-.042.005-.063l-.005.074a.52.52 0 01.038-.191l.019-.041a.397.397 0 01.044-.07.31.31 0 01.033-.039l.012-.012.012-.012a.4.4 0 01.039-.033l-.051.045a.471.471 0 01.164-.108l.039-.014a.39.39 0 01.077-.018.46.46 0 01.064-.005h.807l.499-.498-.502-.502H8.503a.5.5 0 010-1h2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 10.5v4a.5.5 0 01-.41.492L14.5 15h-2a.5.5 0 010-1H14v-3h-.5a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5h1a.5.5 0 010 1H14v1h.5a.5.5 0 01.5.5zM8.5 12a.5.5 0 01.5.5V14h1.5a.5.5 0 010 1h-2a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Qrcode);
var _default = ForwardRef;
exports["default"] = _default;