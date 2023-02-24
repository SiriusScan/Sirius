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

function QuestionCircle2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm2.187 27.499h-4.293v-4.24h4.29v4.009l.002.231zm4.54-15.085c-.149.507-.361.987-.626 1.442s-.585.882-.96 1.289c-.375.407-.786.795-1.234 1.168-.501.416-.903.784-1.207 1.104s-.512.599-.617.834c-.213.457-.32 1.465-.32 3.029h-3.605c0-2.135.208-3.637.626-4.503.407-.832 1.163-1.712 2.274-2.64.48-.393.857-.745 1.122-1.049.267-.304.469-.576.608-.816s.226-.464.258-.672.046-.425.046-.647c0-.418-.071-.8-.215-1.152-.149-.357-.354-.663-.619-.919s-.583-.457-.944-.601a3.235 3.235 0 00-1.218-.215c-1.751 0-2.818 1.223-3.205 3.669H9.049c.096-1.047.334-1.998.711-2.846s.878-1.57 1.493-2.162 1.33-1.049 2.146-1.369a7.24 7.24 0 012.665-.48c1.026 0 1.959.146 2.802.441.843.293 1.566.702 2.167 1.223.606.521 1.074 1.145 1.41 1.874s.503 1.515.503 2.373a5.59 5.59 0 01-.219 1.625z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(QuestionCircle2);
var _default = ForwardRef;
exports["default"] = _default;