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

function Good(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.294 25.623c0-.359-.13-.667-.393-.933a1.258 1.258 0 00-.93-.391c-.359 0-.67.13-.933.391a1.27 1.27 0 00-.393.933c0 .359.13.67.393.933.263.261.571.391.933.391.359 0 .67-.128.93-.391.263-.263.393-.574.393-.933zM28.59 13.248l-10.215-.215c0-.277 1.586-2.581 1.792-2.974.208-.393.434-.773.681-1.138.249-.366.475-.834.683-1.406s.311-1.154.311-1.749c0-.923-.309-1.595-.921-2.016-.615-.421-1.41-.633-2.391-.633-.331 0-.951.96-1.861 2.875a28.85 28.85 0 01-.766 1.346c-.551.882-1.323 1.881-2.315 2.999-.981 1.115-1.678 1.847-2.091 2.192-.951.786-1.915 1.179-2.894 1.179H7.94v13.239h.661c.992 0 2.144.222 3.454.663s2.642.882 4.002 1.323c1.358.441 5.525-.089 6.64-.089 2.606 0 3.909-1.152 3.909-3.454 0-.357-.034-.745-.103-1.159.414-.219.741-.581.981-1.086.24-.503.361-1.01.361-1.52 0-.512-.121-.987-.37-1.429.734-.693 1.097-1.511 1.097-2.462a3.69 3.69 0 00-.208-1.147c-.137-.423.816-.747.61-.981.002-.002.912-1.2-.384-2.361zM31.262 16c.738 1.232-.087 4.309-1.232 4.633.041.29.469.667.469.971 0 1.394-.414 2.622-1.241 3.682.014 1.915-.571 3.429-1.758 4.539s-2.752 1.664-4.695 1.664c-1.833 0-6.981.274-9.586-.677-2.263-.814-3.799-1.218-4.613-1.218H2.649a2.556 2.556 0 01-1.872-.777A2.545 2.545 0 010 26.945V13.708c0-.729.258-1.353.777-1.872a2.552 2.552 0 011.872-.777h5.957c.137 0 .286-.03.446-.094a1.85 1.85 0 00.485-.288c.167-.13.322-.254.466-.37.144-.119.311-.272.498-.466s.327-.341.423-.446a15.262 15.262 0 00.681-.798c.896-1.019 1.586-1.909 2.069-2.667.178-.29.407-.718.683-1.282.274-.565.53-1.063.766-1.49s.514-.862.837-1.303A3.495 3.495 0 0117.098.833 2.904 2.904 0 0118.536.47c1.723 0 3.147.462 4.27 1.385 1.125.923 1.685 2.226 1.685 3.909 0 .937-1.906 4.206-2.208 5.035l7.893.117c3.33.597 1.088 5.083 1.088 5.083z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Good);
var _default = ForwardRef;
exports["default"] = _default;