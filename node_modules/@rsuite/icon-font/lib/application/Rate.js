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

function Rate(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M2.58 2.995L2 2.582l-.58.413a.042.042 0 01-.034.006.04.04 0 01-.027-.049l.205-.695-.56-.435a.06.06 0 01-.023-.046.06.06 0 01.058-.061L1.74 1.7l.225-.664a.037.037 0 01.023-.023.037.037 0 01.047.023l.225.664.701.015a.06.06 0 01.036.106l-.56.435.205.695a.04.04 0 01-.006.034.039.039 0 01-.055.009zM2 3.809a1.04 1.04 0 001.6-1.141l-.012-.04.021-.016A1.06 1.06 0 002.981.715a1.036 1.036 0 00-1.963 0 1.06 1.06 0 00-.627 1.896l.021.016-.012.04a1.04 1.04 0 001.601 1.142zm.58 5.186L2 8.581l-.58.413A.042.042 0 011.386 9a.04.04 0 01-.027-.049l.205-.695-.56-.435a.06.06 0 01-.023-.046.06.06 0 01.058-.061l.701-.015.225-.664a.037.037 0 01.023-.023.037.037 0 01.047.023l.225.664.701.015a.06.06 0 01.036.106l-.56.435.205.695a.04.04 0 01-.006.034.039.039 0 01-.055.009zM2 9.809a1.04 1.04 0 001.6-1.141l-.012-.04.021-.016a1.06 1.06 0 00-.628-1.897 1.037 1.037 0 00-1.963 0 1.06 1.06 0 00-.627 1.896l.021.016-.012.04a1.04 1.04 0 001.601 1.142zm.58 5.186L2 14.581l-.58.413a.042.042 0 01-.034.006.04.04 0 01-.027-.049l.205-.695-.56-.435a.06.06 0 01-.023-.046.06.06 0 01.058-.061l.701-.015.225-.664a.037.037 0 01.023-.023.037.037 0 01.047.023l.225.664.701.015a.06.06 0 01.036.106l-.56.435.205.695a.04.04 0 01-.006.034.039.039 0 01-.055.009zm-.58.814a1.04 1.04 0 001.6-1.141l-.012-.04.021-.016a1.06 1.06 0 00-.628-1.897 1.037 1.037 0 00-1.963 0 1.06 1.06 0 00-.627 1.896l.021.016-.012.04a1.04 1.04 0 001.601 1.142zM8.58 2.995L8 2.582l-.58.413a.042.042 0 01-.034.006.04.04 0 01-.027-.049l.205-.695-.56-.435a.06.06 0 01-.023-.046.06.06 0 01.058-.061L7.74 1.7l.225-.664a.037.037 0 01.023-.023.037.037 0 01.047.023l.225.664.701.015a.06.06 0 01.035.106l-.56.435.205.695a.04.04 0 01-.006.034.039.039 0 01-.055.009zM8 3.809a1.04 1.04 0 001.6-1.141l-.012-.04.021-.016A1.06 1.06 0 008.981.715a1.036 1.036 0 00-1.964 0 1.06 1.06 0 00-.627 1.896l.021.016-.012.04A1.04 1.04 0 008 3.809zm.58 5.186L8 8.581l-.58.413A.042.042 0 017.386 9a.04.04 0 01-.027-.049l.205-.695-.56-.435a.06.06 0 01-.023-.046.06.06 0 01.058-.061l.701-.015.225-.664a.037.037 0 01.023-.023.037.037 0 01.047.023l.225.664.701.015a.06.06 0 01.035.106l-.56.435.205.695a.04.04 0 01-.006.034.039.039 0 01-.055.009zM8 9.809a1.04 1.04 0 001.6-1.141l-.012-.04.021-.016a1.06 1.06 0 00-.628-1.897 1.037 1.037 0 00-1.964 0 1.06 1.06 0 00-.627 1.896l.021.016-.012.04A1.04 1.04 0 008 9.809zM14.58 2.995L14 2.582l-.58.413a.042.042 0 01-.034.006.04.04 0 01-.027-.049l.205-.695-.56-.435a.06.06 0 01-.023-.046.06.06 0 01.058-.061l.701-.015.225-.664a.037.037 0 01.023-.023.037.037 0 01.047.023l.225.664.701.015a.06.06 0 01.035.106l-.56.435.205.695a.04.04 0 01-.006.034.039.039 0 01-.055.009zm-.58.814a1.04 1.04 0 001.6-1.141l-.012-.04.021-.016a1.06 1.06 0 00-.628-1.897 1.036 1.036 0 00-1.964 0 1.06 1.06 0 00-.627 1.896l.021.016-.012.04A1.04 1.04 0 0014 3.809z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Rate);
var _default = ForwardRef;
exports["default"] = _default;