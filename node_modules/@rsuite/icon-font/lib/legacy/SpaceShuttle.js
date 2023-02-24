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

function SpaceShuttle(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 39 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M11.071 20c-1.232.714-2.911 1.143-4.786 1.143H3.999V20H2.856c-.321 0-.571-.643-.571-1.429 0-.321.054-.625.125-.875-1.375-.036-2.411-.268-2.411-.554s1.036-.518 2.411-.554a3.249 3.249 0 01-.125-.875c0-.786.25-1.429.571-1.429h1.143v-1.143h2.286c1.875 0 3.554.429 4.786 1.143h19.875c1.321.232 2.518.429 3.339.571 3.429.571 4.571 1.714 4.571 2.286s-1.143 1.714-4.571 2.286c-.821.143-2.018.339-3.339.571H11.071zm19.983-4.5c.571.393.946.982.946 1.643s-.375 1.25-.946 1.643l1.446.536c.732-.518 1.214-1.304 1.214-2.179s-.482-1.661-1.214-2.179zm-19.893 4.786h18.125s-3.875.679-8.143 1.429c-2.286 0-4 1.714-4 1.714L12 28.572s-1.732 1.143-2.857 1.143H7.429l-1.661-8.286h.518c1.821 0 3.554-.411 4.875-1.143zm-4.875-7.429h-.518l1.661-8.286h1.714c1.161 0 2.286.571 2.857 1.143l5.143 5.143s1.714 1.714 4 1.714c4.268.75 8.143 1.429 8.143 1.429H11.161c-1.321-.732-3.054-1.143-4.875-1.143z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SpaceShuttle);
var _default = ForwardRef;
exports["default"] = _default;