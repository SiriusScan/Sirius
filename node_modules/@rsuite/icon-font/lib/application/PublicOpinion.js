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

function PublicOpinion(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M4 13h7a1 1 0 001-1V6a1 1 0 00-1-1H2a1 1 0 00-1 1v6a1 1 0 001 1h.667L4 14v-1zm1 1v2l-2.667-2H2a2 2 0 01-2-2V6a2 2 0 012-2h9a2 2 0 012 2v6a2 2 0 01-2 2H5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.586 7H14a1 1 0 001-1V2a1 1 0 00-1-1H7a1 1 0 00-1 1v3H5V2a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2l-1 1V8h-.414l1-1z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 8.242c.2-1.109-.107-1.243-.6-1.243-.244 0-.604.284-1.043 1.014a1 1 0 01-1.715 0c-.438-.73-.798-1.014-1.043-1.014-.493 0-.8.134-.6 1.243.112.623.795 1.54 2.5 2.593 1.705-1.053 2.388-1.972 2.5-2.593zM6.5 7.5C6.614 7.311 7 6 8.4 6c1 0 1.8.5 1.6 2.243C9.868 9.396 8.833 10.657 6.5 12 4.167 10.657 3.132 9.397 3 8.243 2.8 6.5 3.6 6 4.6 6 6 6 6.386 7.311 6.5 7.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(PublicOpinion);
var _default = ForwardRef;
exports["default"] = _default;