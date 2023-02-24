import React from 'react';
import isPlainObject from 'lodash/isPlainObject';
import getColumnProps from './getColumnProps';

function getTotalByColumns(columns) {
  var totalFlexGrow = 0;
  var totalWidth = 0;

  var count = function count(items) {
    Array.from(items).forEach(function (column) {
      if ( /*#__PURE__*/React.isValidElement(column)) {
        var _getColumnProps = getColumnProps(column),
            flexGrow = _getColumnProps.flexGrow,
            _getColumnProps$width = _getColumnProps.width,
            width = _getColumnProps$width === void 0 ? 0 : _getColumnProps$width;

        totalFlexGrow += flexGrow || 0;
        totalWidth += flexGrow ? 0 : width;
      } else if (Array.isArray(column)) {
        count(column);
      }
    });
  };

  if (Array.isArray(columns)) {
    count(columns);
  } else if (isPlainObject(columns)) {
    var _columns$props = columns === null || columns === void 0 ? void 0 : columns.props,
        flexGrow = _columns$props.flexGrow,
        _columns$props$width = _columns$props.width,
        width = _columns$props$width === void 0 ? 0 : _columns$props$width;

    totalFlexGrow = flexGrow || 0;
    totalWidth = flexGrow ? 0 : width;
  }

  return {
    totalFlexGrow: totalFlexGrow,
    totalWidth: totalWidth
  };
}

export default getTotalByColumns;