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

function Soundcloud(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 41 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M14 24.5l.286-4.304L14 10.857c-.018-.232-.196-.429-.429-.429-.214 0-.411.196-.411.429l-.25 9.339.25 4.304c.018.232.196.411.411.411A.432.432 0 0014 24.5zm5.286-.518l.196-3.768-.214-10.464a.503.503 0 00-.232-.429c-.089-.054-.179-.089-.286-.089s-.196.036-.286.089a.502.502 0 00-.232.429l-.018.107-.179 10.339.196 4.214v.018a.49.49 0 00.107.304c.107.125.25.196.411.196a.51.51 0 00.357-.161.45.45 0 00.161-.357zM.625 17.911l.357 2.286-.357 2.25c-.018.089-.071.161-.161.161s-.143-.071-.161-.161l-.304-2.25.304-2.286c.018-.089.071-.161.161-.161s.143.071.161.161zM2.161 16.5l.464 3.696-.464 3.625c-.018.089-.089.161-.179.161s-.161-.071-.161-.179l-.411-3.607.411-3.696c0-.089.071-.161.161-.161s.161.071.179.161zm5 8.089zm-3.357-8.768l.446 4.375-.446 4.232c0 .107-.089.196-.196.196s-.196-.089-.214-.196l-.375-4.232.375-4.375c.018-.125.107-.214.214-.214s.196.089.196.214zm1.678-.125l.411 4.5-.411 4.357c-.018.143-.125.232-.25.232S5 24.696 5 24.553l-.375-4.357.375-4.5c0-.143.107-.232.232-.232s.232.089.25.232zm1.679.322l.375 4.179-.375 4.393c-.018.161-.143.286-.286.286s-.268-.125-.268-.286l-.357-4.393.357-4.179c0-.143.125-.268.268-.268s.268.125.286.268zM14 24.5zM8.839 13.411l.375 6.786-.375 4.393a.316.316 0 01-.304.321c-.179 0-.304-.143-.321-.321l-.321-4.393.321-6.786c.018-.179.143-.321.321-.321.161 0 .304.143.304.321zm1.679-1.536l.339 8.357-.339 4.357a.34.34 0 01-.339.339c-.196 0-.339-.143-.357-.339l-.286-4.357.286-8.357c.018-.196.161-.339.357-.339.179 0 .339.143.339.339zm1.75-.714l.321 9.036-.321 4.321a.393.393 0 01-.393.375c-.196 0-.357-.161-.375-.375l-.286-4.321.286-9.036c0-.214.179-.393.375-.393.214 0 .375.179.393.393zm7 13.25zm-3.536-13.322L16 20.196l-.268 4.268c0 .25-.196.446-.446.446s-.429-.196-.446-.446l-.25-4.268.25-9.107c0-.25.196-.446.446-.446s.446.196.446.446zm1.768.34l.25 8.786-.25 4.214c0 .268-.214.482-.482.482s-.482-.214-.5-.482l-.214-4.214.214-8.786c.018-.286.232-.5.5-.5s.464.214.482.5zm3.786 8.785l-.25 4.125c0 .304-.25.554-.554.554s-.554-.25-.571-.554l-.107-2.036-.107-2.089.214-11.357v-.054a.664.664 0 01.214-.429.576.576 0 01.357-.125c.089 0 .196.036.268.089a.59.59 0 01.286.464zm19.857-.339c0 2.786-2.268 5.036-5.054 5.036H22.053c-.304-.036-.554-.268-.554-.589V8.268c0-.304.107-.446.5-.589a8.74 8.74 0 013.232-.607c4.661 0 8.482 3.571 8.893 8.125a5.14 5.14 0 011.964-.393c2.786 0 5.054 2.268 5.054 5.071z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Soundcloud);
var _default = ForwardRef;
exports["default"] = _default;