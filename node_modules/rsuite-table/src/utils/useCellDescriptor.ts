import React, { useState, useCallback, useRef } from 'react';
import addStyle from 'dom-lib/addStyle';
import addClass from 'dom-lib/addClass';
import removeClass from 'dom-lib/removeClass';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import { SCROLLBAR_WIDTH, SORT_TYPE } from '../constants';
import { SortType, RowDataType } from '../@types/common';
import useControlled from './useControlled';
import getTableColumns from './getTableColumns';
import getTotalByColumns from './getTotalByColumns';
import getColumnProps from './getColumnProps';
import useUpdateEffect from './useUpdateEffect';
import { ColumnProps } from '../Column';
import { CellProps } from '../Cell';

interface CellDescriptorProps {
  children: React.ReactNode;
  rtl: boolean;
  minScrollX: React.MutableRefObject<number>;
  scrollX: React.MutableRefObject<number>;
  tableWidth: React.MutableRefObject<number>;
  headerHeight: number;
  showHeader: boolean;
  sortType?: SortType;
  defaultSortType?: SortType;
  sortColumn?: string;
  prefix: (str: string) => string;
  onSortColumn?: (dataKey: string, sortType?: SortType) => void;
  onHeaderCellResize?: (width: number, dataKey: string) => void;
  rowHeight?: number | ((rowData?: RowDataType) => number);
  mouseAreaRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}

interface CellDescriptor {
  columns: React.ReactNode[];
  headerCells: React.ReactNode[];
  bodyCells: React.ReactNode[];
  hasCustomTreeCol: boolean;
  allColumnsWidth: number;
}

/**
 * Attach rendering-related attributes to all cells of the form and cache them.
 * @param props
 * @returns
 */
const useCellDescriptor = (props: CellDescriptorProps): CellDescriptor => {
  const {
    children,
    rtl,
    mouseAreaRef,
    tableRef,
    minScrollX,
    scrollX,
    tableWidth,
    headerHeight,
    showHeader,
    sortType: sortTypeProp,
    defaultSortType,
    sortColumn,
    rowHeight,
    onSortColumn,
    onHeaderCellResize,
    prefix
  } = props;

  const [sortType, setSortType] = useControlled(sortTypeProp, defaultSortType);
  const [cacheData, setCacheData] = useState<CellDescriptor | null>();

  const clearCache = useCallback(() => {
    setCacheData(null);
  }, []);

  const setColumnResizing = useCallback(
    (resizing: boolean) => {
      if (!tableRef.current) {
        return;
      }
      if (resizing) {
        addClass(tableRef.current, prefix('column-resizing'));
      } else {
        removeClass(tableRef.current, prefix('column-resizing'));
      }
    },
    [prefix, tableRef]
  );

  const columnWidths = useRef({});

  useUpdateEffect(() => {
    clearCache();
  }, [children, sortColumn, sortType, tableWidth.current, scrollX.current, minScrollX.current]);

  useUpdateEffect(() => {
    columnWidths.current = {};
  }, [children]);

  const handleColumnResizeEnd = useCallback(
    (columnWidth: number, _cursorDelta: number, dataKey: any, index: number) => {
      columnWidths.current[`${dataKey}_${index}_width`] = columnWidth;

      setColumnResizing(false);

      if (mouseAreaRef.current) {
        addStyle(mouseAreaRef.current, { display: 'none' });
      }

      clearCache();
      onHeaderCellResize?.(columnWidth, dataKey);
    },
    [clearCache, mouseAreaRef, onHeaderCellResize, setColumnResizing]
  );

  const handleColumnResizeMove = useCallback(
    (width: number, left: number, fixed: boolean) => {
      let mouseAreaLeft = width + left;
      let x = mouseAreaLeft;
      let dir = 'left';

      if (rtl) {
        mouseAreaLeft += minScrollX.current + SCROLLBAR_WIDTH;
        dir = 'right';
      }

      if (!fixed) {
        x = mouseAreaLeft + (rtl ? -scrollX.current : scrollX.current);
      }

      if (mouseAreaRef.current) {
        addStyle(mouseAreaRef.current, { display: 'block', [dir]: `${x}px` });
      }
    },
    [minScrollX, mouseAreaRef, rtl, scrollX]
  );

  const handleColumnResizeStart = useCallback(
    (width: number, left: number, fixed: boolean) => {
      setColumnResizing(true);
      handleColumnResizeMove(width, left, fixed);
    },
    [handleColumnResizeMove, setColumnResizing]
  );

  const handleSortColumn = useCallback(
    (dataKey: string) => {
      let nextSortType = sortType;
      if (sortColumn === dataKey) {
        nextSortType =
          sortType === SORT_TYPE.ASC ? (SORT_TYPE.DESC as SortType) : (SORT_TYPE.ASC as SortType);

        setSortType(nextSortType);
      }
      onSortColumn?.(dataKey, nextSortType);
    },
    [onSortColumn, setSortType, sortColumn, sortType]
  );

  if (cacheData) {
    return cacheData;
  }

  let hasCustomTreeCol = false;
  let left = 0; // Cell left margin
  const headerCells: React.ReactNode[] = []; // Table header cell
  const bodyCells: React.ReactNode[] = []; // Table body cell

  if (!children) {
    const cacheCell = {
      columns: [],
      headerCells,
      bodyCells,
      hasCustomTreeCol,
      allColumnsWidth: left
    };
    setCacheData(cacheCell);

    return cacheCell;
  }

  const columns = getTableColumns(children) as React.ReactElement[];
  const count = columns.length;
  const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);

  React.Children.forEach(columns, (column: React.ReactElement<ColumnProps>, index) => {
    if (React.isValidElement(column)) {
      const columnChildren = column.props.children as React.ReactNode[];
      const columnProps = getColumnProps(column);

      const { width, resizable, flexGrow, minWidth, onResize, treeCol } = columnProps;

      if (treeCol) {
        hasCustomTreeCol = true;
      }

      if (resizable && flexGrow) {
        console.warn(
          `Cannot set 'resizable' and 'flexGrow' together in <Column>, column index: ${index}`
        );
      }

      if (columnChildren.length !== 2) {
        throw new Error(`Component <HeaderCell> and <Cell> is required, column index: ${index} `);
      }

      const headerCell = columnChildren[0] as React.ReactElement<CellProps>;
      const cell = columnChildren[1] as React.ReactElement<CellProps>;

      let cellWidth = columnWidths.current?.[`${cell.props.dataKey}_${index}_width`] || width || 0;

      if (tableWidth.current && flexGrow && totalFlexGrow) {
        cellWidth = Math.max(
          ((tableWidth.current - totalWidth) / totalFlexGrow) * flexGrow,
          minWidth || 60
        );
      }

      const cellProps = {
        ...omit(columnProps, ['children']),
        'aria-colindex': index + 1,
        left,
        headerHeight,
        key: index,
        width: cellWidth,
        height: typeof rowHeight === 'function' ? rowHeight() : rowHeight,
        firstColumn: index === 0,
        lastColumn: index === count - 1
      };

      if (showHeader && headerHeight) {
        const headerCellProps = {
          // Resizable column
          // `index` is used to define the serial number when dragging the column width
          index,
          dataKey: cell.props.dataKey,
          isHeaderCell: true,
          minWidth: columnProps.minWidth,
          sortable: columnProps.sortable,
          onSortColumn: handleSortColumn,
          sortType,
          sortColumn,
          flexGrow
        };

        if (resizable) {
          merge(headerCellProps, {
            onResize,
            onColumnResizeEnd: handleColumnResizeEnd,
            onColumnResizeStart: handleColumnResizeStart,
            onColumnResizeMove: handleColumnResizeMove
          });
        }

        headerCells.push(React.cloneElement(headerCell, { ...cellProps, ...headerCellProps }));
      }

      bodyCells.push(React.cloneElement(cell, cellProps));

      left += cellWidth;
    }
  });

  const cacheCell: CellDescriptor = {
    columns,
    headerCells,
    bodyCells,
    allColumnsWidth: left,
    hasCustomTreeCol
  };

  setCacheData(cacheCell);

  return cacheCell;
};

export default useCellDescriptor;
