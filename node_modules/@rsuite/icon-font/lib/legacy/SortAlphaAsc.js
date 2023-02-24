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

function SortAlphaAsc(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M21.268 7.286h3.161l-1.286-3.893-.214-.839c-.018-.143-.036-.25-.036-.357h-.071l-.054.357c-.054.214-.071.482-.196.839zm-8.125 18.428a.656.656 0 01-.179.429l-5.696 5.696C7.143 31.946 7 32 6.857 32s-.286-.054-.411-.161L.732 26.125c-.161-.179-.214-.411-.125-.625s.304-.357.536-.357h3.429V.572c0-.321.25-.571.571-.571h3.429c.321 0 .571.25.571.571v24.571h3.429c.321 0 .571.25.571.571zm14.928 2.125V32H17.642v-1.607l6.589-9.446c.143-.214.286-.393.375-.482l.196-.161v-.054c-.071 0-.143.018-.25.018a2.236 2.236 0 01-.536.054h-4.143v2.054H17.73v-4.089h10.125v1.589l-6.589 9.464c-.107.161-.25.321-.375.464l-.196.196v.036l.25-.036c.161-.036.321-.036.536-.036h4.429v-2.125h2.161zm1.59-16.018v1.893h-5.143v-1.893h1.339l-.839-2.571h-4.339l-.839 2.571h1.339v1.893h-5.125v-1.893h1.25L21.411 0h2.893l4.107 11.821h1.25z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(SortAlphaAsc);
var _default = ForwardRef;
exports["default"] = _default;