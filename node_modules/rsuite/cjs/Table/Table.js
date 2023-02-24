"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _rsuiteTable = require("rsuite-table");

var _utils = require("../utils");

var Table = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var localeProp = props.locale,
      _props$loadAnimation = props.loadAnimation,
      loadAnimation = _props$loadAnimation === void 0 ? true : _props$loadAnimation,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["locale", "loadAnimation"]);

  var _useCustom = (0, _utils.useCustom)('Table', localeProp),
      locale = _useCustom.locale,
      rtl = _useCustom.rtl;

  return /*#__PURE__*/_react.default.createElement(_rsuiteTable.Table, (0, _extends2.default)({}, rest, {
    rtl: rtl,
    ref: ref,
    locale: locale,
    loadAnimation: loadAnimation
  }));
});

Table.Cell = _rsuiteTable.Cell;
Table.Column = _rsuiteTable.Column;
Table.HeaderCell = _rsuiteTable.HeaderCell;
Table.ColumnGroup = _rsuiteTable.ColumnGroup;
Table.displayName = 'Table';
var _default = Table;
exports.default = _default;