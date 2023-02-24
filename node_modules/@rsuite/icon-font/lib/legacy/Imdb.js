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

function Imdb(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 27 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.464 14.232v3.25c0 .643.125 1.232-.679 1.214v-5.518c.786 0 .679.411.679 1.054zm5.643 1.714v2.161c0 .357.107.946-.411.946a.27.27 0 01-.25-.161c-.143-.339-.071-2.911-.071-2.946 0-.25-.071-.839.321-.839.482 0 .411.482.411.839zM3.214 20.161h2.179v-8.429H3.214v8.429zm7.75 0h1.893v-8.429h-2.839l-.5 3.946c-.179-1.321-.357-2.643-.571-3.946H6.126v8.429h1.911V14.59l.804 5.571h1.357l.768-5.696v5.696zm7.59-5.447c0-.536.018-1.107-.089-1.607-.286-1.482-2.071-1.375-3.232-1.375h-1.625v8.429c5.679 0 4.946.393 4.946-5.446zm5.66 3.518v-2.375c0-1.143-.054-1.982-1.464-1.982-.589 0-.982.179-1.375.607v-2.75h-2.089v8.429h1.964l.125-.536c.375.446.786.643 1.375.643 1.304 0 1.464-1 1.464-2.036zm3.215-13.089v21.714a2.866 2.866 0 01-2.857 2.857H2.858a2.866 2.866 0 01-2.857-2.857V5.143a2.866 2.866 0 012.857-2.857h21.714a2.866 2.866 0 012.857 2.857z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Imdb);
var _default = ForwardRef;
exports["default"] = _default;