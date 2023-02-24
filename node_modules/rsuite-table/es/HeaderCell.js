import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["className", "classPrefix", "width", "dataKey", "headerHeight", "children", "left", "sortable", "sortColumn", "sortType", "groupHeader", "resizable", "fixed", "minWidth", "index", "flexGrow", "align", "verticalAlign", "onColumnResizeEnd", "onResize", "onColumnResizeStart", "onColumnResizeMove", "onSortColumn", "renderSortIcon"];
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import Sort from '@rsuite/icons/Sort';
import SortUp from '@rsuite/icons/SortUp';
import SortDown from '@rsuite/icons/SortDown';
import ColumnResizeHandler from './ColumnResizeHandler';
import { useUpdateEffect, useClassNames } from './utils';
import Cell from './Cell';
var SORTED_ICON = {
  desc: SortDown,
  asc: SortUp
};
var HeaderCell = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'cell-header' : _props$classPrefix,
      width = props.width,
      dataKey = props.dataKey,
      headerHeight = props.headerHeight,
      children = props.children,
      left = props.left,
      sortable = props.sortable,
      sortColumn = props.sortColumn,
      sortType = props.sortType,
      groupHeader = props.groupHeader,
      resizable = props.resizable,
      fixed = props.fixed,
      minWidth = props.minWidth,
      index = props.index,
      flexGrow = props.flexGrow,
      align = props.align,
      verticalAlign = props.verticalAlign,
      onColumnResizeEnd = props.onColumnResizeEnd,
      onResize = props.onResize,
      onColumnResizeStart = props.onColumnResizeStart,
      onColumnResizeMove = props.onColumnResizeMove,
      onSortColumn = props.onSortColumn,
      renderSortIcon = props.renderSortIcon,
      rest = _objectWithoutPropertiesLoose(props, _excluded);

  var _useState = useState(isNil(flexGrow) ? width : 0),
      columnWidth = _useState[0],
      setColumnWidth = _useState[1];

  useUpdateEffect(function () {
    setColumnWidth(isNil(flexGrow) ? width : 0);
  }, [flexGrow, width]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix({
    sortable: sortable
  }));
  var ariaSort;

  if (sortColumn === dataKey) {
    ariaSort = 'other';

    if (sortType === 'asc') {
      ariaSort = 'ascending';
    } else if (sortType === 'desc') {
      ariaSort = 'descending';
    }
  }

  var handleClick = useCallback(function () {
    if (sortable) {
      onSortColumn === null || onSortColumn === void 0 ? void 0 : onSortColumn(dataKey);
    }
  }, [dataKey, onSortColumn, sortable]);
  var handleColumnResizeStart = useCallback(function () {
    onColumnResizeStart === null || onColumnResizeStart === void 0 ? void 0 : onColumnResizeStart(columnWidth, left, !!fixed);
  }, [columnWidth, fixed, left, onColumnResizeStart]);
  var handleColumnResizeEnd = useCallback(function (nextColumnWidth, cursorDelta) {
    setColumnWidth(nextColumnWidth);
    onColumnResizeEnd === null || onColumnResizeEnd === void 0 ? void 0 : onColumnResizeEnd(nextColumnWidth, cursorDelta, dataKey, index);
    onResize === null || onResize === void 0 ? void 0 : onResize(nextColumnWidth, dataKey);
  }, [dataKey, index, onColumnResizeEnd, onResize]);

  var renderSortColumn = function renderSortColumn() {
    if (sortable && !groupHeader) {
      var _classNames;

      var SortIcon = sortColumn === dataKey && sortType ? SORTED_ICON[sortType] : Sort;
      var iconClasses = classNames(prefix('icon-sort'), (_classNames = {}, _classNames[prefix("icon-sort-" + sortType)] = sortColumn === dataKey, _classNames));
      var sortIcon = renderSortIcon ? renderSortIcon(sortColumn === dataKey ? sortType : undefined) : /*#__PURE__*/React.createElement(SortIcon, {
        className: iconClasses
      });
      return /*#__PURE__*/React.createElement("span", {
        className: prefix('sort-wrapper')
      }, sortIcon);
    }

    return null;
  };

  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: classes
  }, /*#__PURE__*/React.createElement(Cell, _extends({
    "aria-sort": ariaSort
  }, rest, {
    width: width,
    dataKey: dataKey,
    left: left,
    headerHeight: headerHeight,
    isHeaderCell: true,
    align: !groupHeader ? align : undefined,
    verticalAlign: !groupHeader ? verticalAlign : undefined,
    onClick: !groupHeader ? handleClick : undefined
  }), children, renderSortColumn()), resizable ? /*#__PURE__*/React.createElement(ColumnResizeHandler, {
    defaultColumnWidth: columnWidth,
    key: columnWidth,
    columnLeft: left,
    columnFixed: fixed,
    height: headerHeight ? headerHeight - 1 : undefined,
    minWidth: minWidth,
    onColumnResizeMove: onColumnResizeMove,
    onColumnResizeStart: handleColumnResizeStart,
    onColumnResizeEnd: handleColumnResizeEnd
  }) : null);
});
HeaderCell.displayName = 'HeaderCell';
HeaderCell.propTypes = {
  index: PropTypes.number,
  sortColumn: PropTypes.string,
  sortType: PropTypes.oneOf(['desc', 'asc']),
  sortable: PropTypes.bool,
  resizable: PropTypes.bool,
  minWidth: PropTypes.number,
  onColumnResizeStart: PropTypes.func,
  onColumnResizeEnd: PropTypes.func,
  onResize: PropTypes.func,
  onColumnResizeMove: PropTypes.func,
  onSortColumn: PropTypes.func,
  flexGrow: PropTypes.number,
  fixed: PropTypes.any,
  children: PropTypes.node,
  renderSortIcon: PropTypes.func
};
export default HeaderCell;