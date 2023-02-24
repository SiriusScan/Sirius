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

function Gear(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.967 4.96l-.354-.461.845-2.002-1.935-1.117-1.315 1.738-.574-.073a4.986 4.986 0 00-1.28.003l-.576.076-1.319-1.743-1.935 1.117.85 2.015-.35.461a5.078 5.078 0 00-.638 1.106l-.224.534-2.17.271v2.234l2.169.271.223.537c.164.396.378.769.638 1.11l.35.461-.847 2.008 1.935 1.117 1.312-1.733.576.076c.428.056.862.056 1.291.001l.576-.075 1.31 1.731 1.935-1.117-.842-1.996.352-.461a5.052 5.052 0 00.65-1.125l.223-.536 2.15-.269V6.885l-2.154-.269-.223-.536a4.983 4.983 0 00-.646-1.118zm1.569.733l1.579.197a1 1 0 01.876.992v2.234a1 1 0 01-.876.992l-1.574.197a6.127 6.127 0 01-.778 1.348l.617 1.461a1 1 0 01-.421 1.255l-1.935 1.117a1 1 0 01-1.297-.262l-.96-1.268a5.994 5.994 0 01-1.549-.001l-.961 1.269a.999.999 0 01-1.297.262l-1.935-1.117a1 1 0 01-.421-1.255l.622-1.475a5.974 5.974 0 01-.765-1.332l-1.592-.199a1 1 0 01-.876-.992V6.882a1 1 0 01.876-.992l1.596-.199a6.156 6.156 0 01.764-1.324l-.625-1.482a1 1 0 01.421-1.255L4.96.513a1 1 0 011.297.262l.968 1.279a5.982 5.982 0 011.536-.003L9.727.775a.999.999 0 011.297-.262l1.935 1.117a1 1 0 01.421 1.255l-.619 1.467c.318.414.577.866.775 1.341z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 10a2 2 0 10.001-3.999A2 2 0 008 10zm0 1a3 3 0 110-6 3 3 0 010 6z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Gear);
var _default = ForwardRef;
exports["default"] = _default;