"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _utils = require("../utils");

var PlaceholderGrid = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'placeholder' : _props$classPrefix,
      _props$rows = props.rows,
      rows = _props$rows === void 0 ? 5 : _props$rows,
      _props$columns = props.columns,
      columns = _props$columns === void 0 ? 5 : _props$columns,
      _props$rowHeight = props.rowHeight,
      rowHeight = _props$rowHeight === void 0 ? 10 : _props$rowHeight,
      _props$rowMargin = props.rowMargin,
      rowMargin = _props$rowMargin === void 0 ? 20 : _props$rowMargin,
      active = props.active,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "rows", "columns", "rowHeight", "rowMargin", "active"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix('grid', {
    active: active
  }));
  var colItems = [];
  var firstRowItemWidth = Math.random() * 30 + 30;
  var itemWidth = firstRowItemWidth / 2;

  for (var i = 0; i < columns; i++) {
    var rowItems = [];

    for (var j = 0; j < rows; j++) {
      var widthPercent = Math.random() * 50 + 10; // when first column

      if (i > 0) {
        // when other columns
        widthPercent = j > 0 ? itemWidth : firstRowItemWidth;
      }

      rowItems.push( /*#__PURE__*/_react.default.createElement("p", {
        key: j,
        style: {
          width: widthPercent + "%",
          height: rowHeight,
          marginTop: j > 0 ? rowMargin : undefined
        }
      }));
    }

    colItems.push( /*#__PURE__*/_react.default.createElement("div", {
      key: i,
      className: (0, _classnames.default)(prefix('grid-col'))
    }, rowItems));
  }

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), colItems);
});

PlaceholderGrid.displayName = 'PlaceholderGrid';
PlaceholderGrid.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  rows: _propTypes.default.number,
  columns: _propTypes.default.number,
  rowHeight: _propTypes.default.number,
  rowMargin: _propTypes.default.number,
  active: _propTypes.default.bool
};
var _default = PlaceholderGrid;
exports.default = _default;