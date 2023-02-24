"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _ProgressCircle = _interopRequireDefault(require("./ProgressCircle"));

var _ProgressLine = _interopRequireDefault(require("./ProgressLine"));

var Progress = _ProgressLine.default;
Progress.Line = _ProgressLine.default;
Progress.Circle = _ProgressCircle.default;
var _default = Progress;
exports.default = _default;