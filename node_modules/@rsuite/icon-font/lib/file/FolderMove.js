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

function FolderMove(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.5 1h.012a.42.42 0 01.062.005L5.5 1a.52.52 0 01.191.038l.041.019a.471.471 0 01.122.089L5.801 1.1l.041.034.012.012 1.5 1.5a.5.5 0 01-.707.707L5.294 1.999H1.001v12h3.5a.5.5 0 010 1h-4a.5.5 0 01-.5-.5v-12.5a1 1 0 01.883-.993l.117-.007h4.5zm10 3a.5.5 0 01.5.5v2a.5.5 0 01-1 0V5h-1.5a.5.5 0 010-1h2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 3.5h.012a.42.42 0 01.062.005L9.5 3.5a.52.52 0 01.191.038l.041.019a.471.471 0 01.122.089l-.051-.045a.31.31 0 01.039.033l.012.012 2 2a.5.5 0 01-.707.707l-1.146-1.147v3.793h3.792l-1.146-1.146a.5.5 0 01.707-.707l2.012 2.012a.4.4 0 01.033.039l-.045-.051a.471.471 0 01.108.164l.014.039a.39.39 0 01.018.079.475.475 0 01.005.053v.041c-.001.017-.002.034-.005.051l.005-.072a.52.52 0 01-.038.191l-.019.041a.397.397 0 01-.044.07.31.31 0 01-.033.039l-.012.012-2 2a.5.5 0 01-.707-.707l1.146-1.146H10v3.792l1.146-1.146a.5.5 0 01.707.707l-2.012 2.012a.4.4 0 01-.039.033l.051-.045a.471.471 0 01-.164.108l-.039.014a.39.39 0 01-.046.012l-.033.006-.052.005h-.041a.436.436 0 01-.052-.005l.072.005a.52.52 0 01-.191-.038l-.041-.019a.397.397 0 01-.07-.044.31.31 0 01-.039-.033l-.012-.012-2-2a.5.5 0 01.707-.707l1.146 1.146V10H5.205l1.147 1.146a.5.5 0 01.058.638l-.058.069a.5.5 0 01-.707 0l-2-2-.012-.012c-.011-.012-.023-.025-.033-.039a.758.758 0 01-.045-.07.389.389 0 01-.019-.042l-.014-.039a.39.39 0 01-.018-.077.446.446 0 01-.005-.063v-.023c0-.021.002-.042.005-.063l-.005.074a.52.52 0 01.038-.191l.019-.041a.471.471 0 01.089-.122l-.045.051a.31.31 0 01.033-.039l.012-.012 2-2a.5.5 0 01.707.707L5.205 8.998h3.793V5.205L7.852 6.352a.5.5 0 01-.638.058l-.069-.058a.5.5 0 010-.707l2-2 .012-.012c.012-.011.025-.023.039-.033a.758.758 0 01.07-.045.389.389 0 01.042-.019l.039-.014a.39.39 0 01.077-.018.46.46 0 01.064-.005h.011zm4 11.5a.5.5 0 010-1H15v-1.5a.5.5 0 011 0v2a.5.5 0 01-.41.492L15.5 15h-2z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(FolderMove);
var _default = ForwardRef;
exports["default"] = _default;