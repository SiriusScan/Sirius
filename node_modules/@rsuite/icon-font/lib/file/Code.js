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

function Code(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.033 1.321a.5.5 0 01.958.272l-.025.087-5 13a.5.5 0 01-.958-.272l.025-.087 5-13zm5.802 7.091l-2.859 2.917c-.223.228-.585.228-.809 0s-.223-.597 0-.825L14.623 8l-2.456-2.504a.592.592 0 01-.066-.744l.066-.081a.563.563 0 01.729-.067l.079.067 2.859 2.917c.099.101.154.23.165.363v.099a.588.588 0 01-.165.363zM.165 7.588l2.859-2.917c.223-.228.585-.228.809 0s.223.597 0 .825L1.377 8l2.456 2.504a.592.592 0 01.066.744l-.066.081a.563.563 0 01-.729.068l-.079-.068L.166 8.412a.585.585 0 01-.165-.363V7.95a.588.588 0 01.165-.363z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Code);
var _default = ForwardRef;
exports["default"] = _default;