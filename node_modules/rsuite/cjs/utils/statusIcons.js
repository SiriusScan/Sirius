"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.PROGRESS_STATUS_ICON = exports.MESSAGE_STATUS_ICONS = void 0;

var _react = _interopRequireDefault(require("react"));

var _Info = _interopRequireDefault(require("@rsuite/icons/legacy/Info"));

var _CheckCircle = _interopRequireDefault(require("@rsuite/icons/legacy/CheckCircle"));

var _CloseCircle = _interopRequireDefault(require("@rsuite/icons/legacy/CloseCircle"));

var _Remind = _interopRequireDefault(require("@rsuite/icons/legacy/Remind"));

var _Check = _interopRequireDefault(require("@rsuite/icons/Check"));

var _Close = _interopRequireDefault(require("@rsuite/icons/Close"));

var MESSAGE_STATUS_ICONS = {
  info: /*#__PURE__*/_react.default.createElement(_Info.default, null),
  success: /*#__PURE__*/_react.default.createElement(_CheckCircle.default, null),
  error: /*#__PURE__*/_react.default.createElement(_CloseCircle.default, null),
  warning: /*#__PURE__*/_react.default.createElement(_Remind.default, null)
};
exports.MESSAGE_STATUS_ICONS = MESSAGE_STATUS_ICONS;
var PROGRESS_STATUS_ICON = {
  success: /*#__PURE__*/_react.default.createElement(_Check.default, null),
  active: null,
  fail: /*#__PURE__*/_react.default.createElement(_Close.default, null)
};
exports.PROGRESS_STATUS_ICON = PROGRESS_STATUS_ICON;