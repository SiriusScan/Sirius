import _extends from "@babel/runtime/helpers/esm/extends";
import React from 'react';
import * as ReactIs from 'react-is';
import flatten from 'lodash/flatten';
import ColumnGroup from '../ColumnGroup';
/**
 * Get the columns ReactElement array.
 * - Handling the case where there is an array of <Column> in children.
 * - Filter empty items in children.
 */

function getTableColumns(children) {
  var childrenArray = Array.isArray(children) ? children : [children];
  var flattenColumns = flatten(childrenArray).map(function (column) {
    // If the column is a group, we need to get the columns from the children.
    if ((column === null || column === void 0 ? void 0 : column.type) === ColumnGroup) {
      var _column$props = column === null || column === void 0 ? void 0 : column.props,
          header = _column$props.header,
          groupChildren = _column$props.children,
          align = _column$props.align,
          fixed = _column$props.fixed,
          verticalAlign = _column$props.verticalAlign,
          groupHeaderHeight = _column$props.groupHeaderHeight;

      var childColumns = getTableColumns(groupChildren);
      return childColumns.map(function (childColumn, index) {
        // Overwrite the props set by ColumnGroup to Column.
        var groupCellProps = _extends({}, childColumn === null || childColumn === void 0 ? void 0 : childColumn.props, {
          groupHeaderHeight: groupHeaderHeight,
          fixed: fixed,
          // Column extends the properties of Group （align，verticalAlign）
          align: (childColumn === null || childColumn === void 0 ? void 0 : childColumn.props.align) || align,
          verticalAlign: (childColumn === null || childColumn === void 0 ? void 0 : childColumn.props.verticalAlign) || verticalAlign
        });
        /**
         * Set attributes for the first column in the group:
         * @field groupCount: The number of grouping sub-items.
         * @field groupHeader: Group header title.
         * @field resizable: Set to not resizable.
         */


        if (index === 0) {
          groupCellProps.groupAlign = align;
          groupCellProps.groupVerticalAlign = verticalAlign;
          groupCellProps.groupCount = childColumns.length;
          groupCellProps.groupHeader = header;
          groupCellProps.resizable = false;
        }

        return /*#__PURE__*/React.cloneElement(childColumn, groupCellProps);
      });
    } else if (ReactIs.isFragment(column)) {
      var _column$props2;

      // If the column is a fragment, we need to get the columns from the children.
      return getTableColumns((_column$props2 = column.props) === null || _column$props2 === void 0 ? void 0 : _column$props2.children);
    } else if (Array.isArray(column)) {
      // If the column is an array, need check item in the array.
      return getTableColumns(column);
    } // If the column is not a group, we just return the column.


    return column;
  }); // Flatten the array in Columns into a one-dimensional array, and calculate lastColumn and firstColumn.

  return flatten(flattenColumns).filter(Boolean);
}

export default getTableColumns;