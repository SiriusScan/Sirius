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

function OrderForm(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M7.353 9.563H22.02c.194 0 .354-.064.48-.19s.187-.286.187-.478V7.56c0-.194-.062-.354-.187-.48s-.286-.187-.48-.187H7.353a.645.645 0 00-.668.667v1.335c0 .194.064.354.19.478.126.126.283.19.478.19z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M28.75.583A1.925 1.925 0 0027.333 0H4.666C4.111 0 3.64.194 3.249.583A1.925 1.925 0 002.666 2v28c0 .555.194 1.029.583 1.417.391.389.862.583 1.417.583h13.335c.555 0 1.166-.139 1.833-.416.667-.279 1.195-.61 1.582-1.001l6.501-6.498c.386-.389.722-.917.999-1.584s.416-1.278.416-1.833h.002V2.001a1.92 1.92 0 00-.583-1.417zm-2.709 21.604l-6.521 6.521c-.167.167-.45.32-.853.457v-7.833H26.5c-.139.402-.293.688-.459.855zm.626-3.522H18a1.92 1.92 0 00-1.415.583A1.927 1.927 0 0016 20.665v8.667H5.333V2.665h21.335v16z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.353 14.896H22.02c.194 0 .354-.062.48-.187s.187-.283.187-.478v-1.335c0-.194-.062-.354-.187-.48s-.286-.187-.48-.187H7.353a.645.645 0 00-.668.667v1.335a.643.643 0 00.668.665zM7.353 20.208h4.722c.194 0 .354-.062.48-.187s.187-.286.187-.478v-1.335c0-.194-.062-.354-.187-.48s-.286-.187-.48-.187H7.353a.645.645 0 00-.668.667v1.335a.643.643 0 00.668.665z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(OrderForm);
var _default = ForwardRef;
exports["default"] = _default;