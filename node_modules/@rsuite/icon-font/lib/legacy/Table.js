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

function Table(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.143 24.571v-3.429a.564.564 0 00-.571-.571H2.858a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zm0-6.857v-3.429a.564.564 0 00-.571-.571H2.858a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zm9.143 6.857v-3.429a.564.564 0 00-.571-.571h-5.714a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zM9.143 10.857V7.428a.564.564 0 00-.571-.571H2.858a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zm9.143 6.857v-3.429a.564.564 0 00-.571-.571h-5.714a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zm9.143 6.857v-3.429a.564.564 0 00-.571-.571h-5.714a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zm-9.143-13.714V7.428a.564.564 0 00-.571-.571h-5.714a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zm9.143 6.857v-3.429a.564.564 0 00-.571-.571h-5.714a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zm0-6.857V7.428a.564.564 0 00-.571-.571h-5.714a.564.564 0 00-.571.571v3.429c0 .321.25.571.571.571h5.714c.321 0 .571-.25.571-.571zm2.285-5.714v19.429a2.866 2.866 0 01-2.857 2.857h-24A2.866 2.866 0 010 24.572V5.143a2.866 2.866 0 012.857-2.857h24a2.866 2.866 0 012.857 2.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Table);
var _default = ForwardRef;
exports["default"] = _default;