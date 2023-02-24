import React from 'react';
import isPlainObject from 'lodash/isPlainObject';
import getColumnProps, { Column } from './getColumnProps';

function getTotalByColumns(columns: Column | React.ReactNode[]) {
  let totalFlexGrow = 0;
  let totalWidth = 0;

  const count = (items: React.ReactNode[]) => {
    Array.from(items).forEach(column => {
      if (React.isValidElement(column)) {
        const { flexGrow, width = 0 } = getColumnProps(column as Column);
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
    const { flexGrow, width = 0 } = columns?.props;

    totalFlexGrow = flexGrow || 0;
    totalWidth = flexGrow ? 0 : width;
  }

  return {
    totalFlexGrow,
    totalWidth
  };
}

export default getTotalByColumns;
