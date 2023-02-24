import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import Sort from '@rsuite/icons/Sort';
import SortUp from '@rsuite/icons/SortUp';
import SortDown from '@rsuite/icons/SortDown';
import ColumnResizeHandler, { FixedType } from './ColumnResizeHandler';
import { useUpdateEffect, useClassNames } from './utils';
import Cell, { InnerCellProps } from './Cell';

export interface HeaderCellProps extends InnerCellProps {
  index?: number;
  minWidth?: number;
  sortColumn?: string;
  sortType?: 'desc' | 'asc';
  sortable?: boolean;
  resizable?: boolean;
  groupHeader?: boolean;
  flexGrow?: number;
  fixed?: boolean | 'left' | 'right';
  children: React.ReactNode;
  onResize?: (columnWidth?: number, dataKey?: string) => void;
  onSortColumn?: (dataKey?: string) => void;
  onColumnResizeStart?: (columnWidth?: number, left?: number, fixed?: boolean) => void;
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: FixedType) => void;
  onColumnResizeEnd?: (
    columnWidth?: number,
    cursorDelta?: number,
    dataKey?: any,
    index?: number
  ) => void;
  renderSortIcon?: (sortType?: 'desc' | 'asc') => React.ReactNode;
}

const SORTED_ICON = {
  desc: SortDown,
  asc: SortUp
};

const HeaderCell = React.forwardRef((props: HeaderCellProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    className,
    classPrefix = 'cell-header',
    width,
    dataKey,
    headerHeight,
    children,
    left,
    sortable,
    sortColumn,
    sortType,
    groupHeader,
    resizable,
    fixed,
    minWidth,
    index,
    flexGrow,
    align,
    verticalAlign,
    onColumnResizeEnd,
    onResize,
    onColumnResizeStart,
    onColumnResizeMove,
    onSortColumn,
    renderSortIcon,
    ...rest
  } = props;

  const [columnWidth, setColumnWidth] = useState(isNil(flexGrow) ? width : 0);

  useUpdateEffect(() => {
    setColumnWidth(isNil(flexGrow) ? width : 0);
  }, [flexGrow, width]);

  const { withClassPrefix, merge, prefix } = useClassNames(classPrefix);
  const classes = merge(className, withClassPrefix({ sortable }));

  let ariaSort;

  if (sortColumn === dataKey) {
    ariaSort = 'other';
    if (sortType === 'asc') {
      ariaSort = 'ascending';
    } else if (sortType === 'desc') {
      ariaSort = 'descending';
    }
  }

  const handleClick = useCallback(() => {
    if (sortable) {
      onSortColumn?.(dataKey);
    }
  }, [dataKey, onSortColumn, sortable]);

  const handleColumnResizeStart = useCallback(() => {
    onColumnResizeStart?.(columnWidth, left, !!fixed);
  }, [columnWidth, fixed, left, onColumnResizeStart]);

  const handleColumnResizeEnd = useCallback(
    (nextColumnWidth?: number, cursorDelta?: number) => {
      setColumnWidth(nextColumnWidth);
      onColumnResizeEnd?.(nextColumnWidth, cursorDelta, dataKey, index);
      onResize?.(nextColumnWidth, dataKey);
    },
    [dataKey, index, onColumnResizeEnd, onResize]
  );

  const renderSortColumn = () => {
    if (sortable && !groupHeader) {
      const SortIcon = sortColumn === dataKey && sortType ? SORTED_ICON[sortType] : Sort;
      const iconClasses = classNames(prefix('icon-sort'), {
        [prefix(`icon-sort-${sortType}`)]: sortColumn === dataKey
      });

      const sortIcon = renderSortIcon ? (
        renderSortIcon(sortColumn === dataKey ? sortType : undefined)
      ) : (
        <SortIcon className={iconClasses} />
      );

      return <span className={prefix('sort-wrapper')}>{sortIcon}</span>;
    }
    return null;
  };

  return (
    <div ref={ref} className={classes}>
      <Cell
        aria-sort={ariaSort}
        {...rest}
        width={width}
        dataKey={dataKey}
        left={left}
        headerHeight={headerHeight}
        isHeaderCell={true}
        align={!groupHeader ? align : undefined}
        verticalAlign={!groupHeader ? verticalAlign : undefined}
        onClick={!groupHeader ? handleClick : undefined}
      >
        {children}
        {renderSortColumn()}
      </Cell>

      {resizable ? (
        <ColumnResizeHandler
          defaultColumnWidth={columnWidth}
          key={columnWidth}
          columnLeft={left}
          columnFixed={fixed}
          height={headerHeight ? headerHeight - 1 : undefined}
          minWidth={minWidth}
          onColumnResizeMove={onColumnResizeMove}
          onColumnResizeStart={handleColumnResizeStart}
          onColumnResizeEnd={handleColumnResizeEnd}
        />
      ) : null}
    </div>
  );
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
