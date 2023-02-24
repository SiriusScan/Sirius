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

function Cog(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.286 16c0-2.518-2.054-4.571-4.571-4.571S9.144 13.483 9.144 16s2.054 4.571 4.571 4.571 4.571-2.054 4.571-4.571zm9.143-1.946v3.964c0 .268-.214.589-.5.643l-3.304.5a10.164 10.164 0 01-.696 1.625c.607.875 1.25 1.661 1.911 2.464.107.125.179.286.179.446s-.054.286-.161.411c-.429.571-2.839 3.196-3.446 3.196-.161 0-.321-.071-.464-.161l-2.464-1.929c-.518.268-1.071.5-1.625.679-.125 1.089-.232 2.25-.518 3.321a.653.653 0 01-.643.5h-3.964c-.321 0-.607-.232-.643-.536l-.5-3.286a10.502 10.502 0 01-1.607-.661l-2.518 1.911c-.125.107-.286.161-.446.161s-.321-.071-.446-.196c-.946-.857-2.196-1.964-2.946-3a.697.697 0 01.018-.822c.607-.821 1.268-1.607 1.875-2.446a9.4 9.4 0 01-.732-1.768l-3.268-.482c-.304-.054-.518-.339-.518-.643v-3.964c0-.268.214-.589.482-.643l3.321-.5a9.56 9.56 0 01.696-1.643 42.792 42.792 0 00-1.911-2.464.66.66 0 01-.179-.429c0-.161.071-.286.161-.411.429-.589 2.839-3.196 3.446-3.196.161 0 .321.071.464.179l2.464 1.911c.518-.268 1.071-.5 1.625-.679.125-1.089.232-2.25.518-3.321a.653.653 0 01.643-.5h3.964c.321 0 .607.232.643.536l.5 3.286c.554.179 1.089.393 1.607.661l2.536-1.911c.107-.107.268-.161.429-.161s.321.071.446.179c.946.875 2.196 1.982 2.946 3.036a.61.61 0 01.125.393.676.676 0 01-.143.411c-.607.821-1.268 1.607-1.875 2.446.304.571.554 1.161.732 1.75l3.268.5c.304.054.518.339.518.643z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Cog);
var _default = ForwardRef;
exports["default"] = _default;