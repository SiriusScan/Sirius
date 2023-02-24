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

function Spinner(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M9.393 24.893a2.29 2.29 0 01-2.286 2.286 2.302 2.302 0 01-2.286-2.286 2.29 2.29 0 012.286-2.286 2.279 2.279 0 012.286 2.286zm8.893 3.678c0 1.268-1.018 2.286-2.286 2.286s-2.286-1.018-2.286-2.286 1.018-2.286 2.286-2.286 2.286 1.018 2.286 2.286zM5.714 16c0 1.268-1.018 2.286-2.286 2.286S1.142 17.268 1.142 16s1.018-2.286 2.286-2.286S5.714 14.732 5.714 16zm21.465 8.893a2.302 2.302 0 01-2.286 2.286 2.29 2.29 0 01-2.286-2.286 2.279 2.279 0 012.286-2.286 2.29 2.29 0 012.286 2.286zM9.964 7.107c0 1.571-1.286 2.857-2.857 2.857S4.25 8.678 4.25 7.107 5.536 4.25 7.107 4.25s2.857 1.286 2.857 2.857zM30.857 16c0 1.268-1.018 2.286-2.286 2.286S26.285 17.268 26.285 16s1.018-2.286 2.286-2.286 2.286 1.018 2.286 2.286zM19.429 3.429a3.43 3.43 0 01-6.858 0 3.43 3.43 0 016.858 0zm9.464 3.678c0 2.214-1.804 4-4 4-2.214 0-4-1.786-4-4 0-2.196 1.786-4 4-4 2.196 0 4 1.804 4 4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Spinner);
var _default = ForwardRef;
exports["default"] = _default;