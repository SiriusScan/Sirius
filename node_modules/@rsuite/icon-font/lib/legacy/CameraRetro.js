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

function CameraRetro(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.571 14.857a.564.564 0 00-.571-.571 2.866 2.866 0 00-2.857 2.857c0 .321.25.571.571.571s.571-.25.571-.571c0-.946.768-1.714 1.714-1.714.321 0 .571-.25.571-.571zm4 2.322c0 2.518-2.054 4.571-4.571 4.571s-4.571-2.054-4.571-4.571 2.054-4.571 4.571-4.571 4.571 2.054 4.571 4.571zM2.286 27.429h27.429v-2.286H2.286v2.286zm20.571-10.25c0-3.786-3.071-6.857-6.857-6.857s-6.857 3.071-6.857 6.857 3.071 6.857 6.857 6.857 6.857-3.071 6.857-6.857zM4.571 5.714h6.857V3.428H4.571v2.286zM2.286 9.143h27.429V4.572H14.929l-1.143 2.286h-11.5v2.286zM32 4.571v22.857a2.279 2.279 0 01-2.286 2.286H2.285a2.279 2.279 0 01-2.286-2.286V4.571a2.279 2.279 0 012.286-2.286h27.429A2.279 2.279 0 0132 4.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(CameraRetro);
var _default = ForwardRef;
exports["default"] = _default;