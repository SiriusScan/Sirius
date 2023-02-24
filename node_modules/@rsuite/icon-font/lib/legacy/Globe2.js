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

function Globe2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M28.19 5.65a15.738 15.738 0 00-1.401-1.44A15.998 15.998 0 0018.865.269c-.93-.169-1.883-.27-2.864-.27-.997 0-1.97.103-2.917.279-1.01.185-1.984.469-2.917.834a16 16 0 00-4.958 3.097c-.494.453-.965.93-1.399 1.44A15.92 15.92 0 000 15.999c0 4.096 1.552 7.822 4.082 10.651a15.998 15.998 0 006.082 4.235c.933.366 1.906.649 2.917.834.949.176 1.922.279 2.919.279.981 0 1.934-.101 2.866-.27a16.028 16.028 0 007.625-3.667c.505-.439.978-.912 1.426-1.41 2.53-2.832 4.082-6.558 4.082-10.654 0-3.95-1.438-7.559-3.81-10.35zM13.083 2.311c.183-.039.37-.064.555-.096-.091.055-.183.112-.277.167a16.076 16.076 0 00-4.91 4.693 14.184 14.184 0 01-1.847-1.424 13.952 13.952 0 016.478-3.339zM5.209 7.09a15.896 15.896 0 002.242 1.721 15.899 15.899 0 00-1.669 6.187H2.049a13.932 13.932 0 013.159-7.909zM2.05 17.001h3.733a15.916 15.916 0 001.897 6.654c-.768.469-1.495.997-2.171 1.586a13.939 13.939 0 01-3.458-8.24zm11.033 12.688a13.956 13.956 0 01-6.146-3.038 14.156 14.156 0 011.824-1.31 16.115 16.115 0 004.601 4.277c.091.057.183.112.274.167-.183-.032-.37-.057-.553-.096zm1.916-1.422A14.097 14.097 0 0110.56 24.4a13.896 13.896 0 014.439-1.049v4.917zm0-6.914c-1.966.121-3.835.59-5.547 1.36a13.91 13.91 0 01-1.669-5.712h7.216v4.352zm0-6.354H7.783c.133-1.865.633-3.63 1.429-5.225a15.907 15.907 0 005.787 1.477V15zm0-5.749a13.86 13.86 0 01-4.77-1.209 14.107 14.107 0 014.77-4.309V9.25zm11.792-2.16a13.939 13.939 0 013.159 7.909h-3.833a15.904 15.904 0 00-1.646-6.142 15.94 15.94 0 002.32-1.767zm-7.925-4.793a13.968 13.968 0 016.528 3.353 14.125 14.125 0 01-1.92 1.467 16.056 16.056 0 00-4.937-4.736c-.103-.062-.206-.126-.311-.187.215.034.43.059.64.103zm-1.865 1.497a14.117 14.117 0 014.697 4.283 13.894 13.894 0 01-4.697 1.173V3.794zm0 7.456a15.837 15.837 0 005.705-1.438 13.86 13.86 0 011.41 5.186h-7.115v-3.749zm0 5.751h7.115a13.898 13.898 0 01-1.646 5.675A15.836 15.836 0 0017 21.353v-4.352zm0 6.352c1.534.11 3.001.455 4.359 1.022a14.075 14.075 0 01-4.359 3.833v-4.855zm1.865 6.35c-.21.043-.427.069-.64.103l.311-.187a16.054 16.054 0 004.633-4.318c.667.4 1.303.848 1.893 1.351a13.957 13.957 0 01-6.197 3.051zm7.623-4.464a15.968 15.968 0 00-2.247-1.632 15.953 15.953 0 001.872-6.608h3.833a13.901 13.901 0 01-3.458 8.24z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Globe2);
var _default = ForwardRef;
exports["default"] = _default;