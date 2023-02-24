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

function Model(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.129.017l.083.03 7.5 3.5a.5.5 0 01.075.863l-.084.047-4.5 2a.5.5 0 01-.485-.87l.079-.044 3.496-1.554L8 1.052 1.619 4.029l3.114 1.662a3.999 3.999 0 013.859-1.647.5.5 0 01-.147.989 3 3 0 102.524 3.41.5.5 0 01.989.147 4.09 4.09 0 01-.218.836l3.998 2.132a.5.5 0 01.056.848l-.08.046-7.5 3.5a.5.5 0 01-.34.03l-.083-.03-7.5-3.5a.5.5 0 01-.101-.844l.077-.05 3.998-2.132a3.977 3.977 0 01-.218-2.018 4.09 4.09 0 01.218-.836L.267 4.44a.5.5 0 01-.056-.848l.08-.046 7.5-3.5a.5.5 0 01.34-.03zm-.72 11.939a3.992 3.992 0 01-2.675-1.647L1.619 11.97l6.38 2.977 6.381-2.977-3.113-1.661a3.999 3.999 0 01-3.859 1.647z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 8a1 1 0 11-2 0 1 1 0 012 0z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Model);
var _default = ForwardRef;
exports["default"] = _default;