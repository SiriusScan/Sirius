import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useClassNames } from '../utils';
var PlaceholderGrid = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "classPrefix", "rows", "columns", "rowHeight", "rowMargin", "active"]);

  var _useClassNames = useClassNames(classPrefix),
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

      rowItems.push( /*#__PURE__*/React.createElement("p", {
        key: j,
        style: {
          width: widthPercent + "%",
          height: rowHeight,
          marginTop: j > 0 ? rowMargin : undefined
        }
      }));
    }

    colItems.push( /*#__PURE__*/React.createElement("div", {
      key: i,
      className: classNames(prefix('grid-col'))
    }, rowItems));
  }

  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), colItems);
});
PlaceholderGrid.displayName = 'PlaceholderGrid';
PlaceholderGrid.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  rows: PropTypes.number,
  columns: PropTypes.number,
  rowHeight: PropTypes.number,
  rowMargin: PropTypes.number,
  active: PropTypes.bool
};
export default PlaceholderGrid;