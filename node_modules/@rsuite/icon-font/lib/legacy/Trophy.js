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

function Trophy(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.179 15.768c-.75-1.643-1.321-3.821-1.321-6.625H2.287v1.714c0 1.75 2.375 4.179 5.893 4.911zm19.25-4.911V9.143h-4.571c0 2.804-.571 4.982-1.321 6.625 3.518-.732 5.893-3.161 5.893-4.911zm2.285-2.286v2.286c0 3.393-4.107 7.143-9.679 7.411a9.61 9.61 0 01-1.696 1.696c-.946.857-1.196 1.75-1.196 2.893s.571 2.286 2.286 2.286 3.429 1.143 3.429 2.857v1.143c0 .321-.25.571-.571.571H7.43a.564.564 0 01-.571-.571V28c0-1.714 1.714-2.857 3.429-2.857s2.286-1.143 2.286-2.286-.25-2.036-1.196-2.893a9.646 9.646 0 01-1.696-1.696C4.111 18 .003 14.25.003 10.857V8.571c0-.946.768-1.714 1.714-1.714H6.86V5.143a2.866 2.866 0 012.857-2.857h10.286a2.866 2.866 0 012.857 2.857v1.714h5.143c.946 0 1.714.768 1.714 1.714z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Trophy);
var _default = ForwardRef;
exports["default"] = _default;