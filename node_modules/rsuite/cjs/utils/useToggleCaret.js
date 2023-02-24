"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _react = require("react");

var _AngleDown = _interopRequireDefault(require("@rsuite/icons/legacy/AngleDown"));

var _AngleUp = _interopRequireDefault(require("@rsuite/icons/legacy/AngleUp"));

var _AngleLeft = _interopRequireDefault(require("@rsuite/icons/legacy/AngleLeft"));

var _AngleRight = _interopRequireDefault(require("@rsuite/icons/legacy/AngleRight"));

var _useCustom2 = _interopRequireDefault(require("./useCustom"));

function useToggleCaret(placement) {
  var _useCustom = (0, _useCustom2.default)('Dropdown'),
      rtl = _useCustom.rtl;

  return (0, _react.useMemo)(function () {
    switch (true) {
      case /^top/.test(placement):
        return _AngleUp.default;

      case /^right/.test(placement):
        return rtl ? _AngleLeft.default : _AngleRight.default;

      case /^left/.test(placement):
        return rtl ? _AngleRight.default : _AngleLeft.default;

      case /^bottom/.test(placement):
      default:
        return _AngleDown.default;
    }
  }, [placement, rtl]);
}

var _default = useToggleCaret;
exports.default = _default;