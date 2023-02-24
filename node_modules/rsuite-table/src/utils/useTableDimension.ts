import React, { useRef, useCallback } from 'react';
import getWidth from 'dom-lib/getWidth';
import getHeight from 'dom-lib/getHeight';
import getOffset from 'dom-lib/getOffset';
import { SCROLLBAR_WIDTH } from '../constants';
import { ResizeObserver } from '@juggle/resize-observer';
import useMount from './useMount';
import useUpdateLayoutEffect from './useUpdateLayoutEffect';
import isNumberOrTrue from './isNumberOrTrue';
import { RowDataType, RowKeyType, ElementOffset } from '../@types/common';
import debounce from 'lodash/debounce';

interface TableDimensionProps {
  data?: readonly RowDataType[];
  rowHeight: number | ((rowData: RowDataType) => number);
  height: number;
  minHeight: number;
  tableRef?: React.RefObject<HTMLDivElement>;
  headerWrapperRef?: React.RefObject<HTMLDivElement>;
  width?: number;
  prefix: (str: string) => string;
  affixHeader?: boolean | number;
  affixHorizontalScrollbar?: boolean | number;
  headerHeight: number;
  autoHeight?: boolean;
  fillHeight?: boolean;
  children?: React.ReactNode;
  expandedRowKeys?: RowKeyType[];
  showHeader?: boolean;
  onTableScroll?: (coord: { x?: number; y?: number }) => void;
  onTableResizeChange?: (
    prevSize: number,
    event: 'bodyHeightChanged' | 'bodyWidthChanged' | 'widthChanged' | 'heightChanged'
  ) => void;
}

/**
 * The dimension information of the table,
 * including the height, width, scrollable distance and the coordinates of the scroll handle, etc.
 * @param props
 * @returns
 */
const useTableDimension = (props: TableDimensionProps) => {
  const {
    data,
    rowHeight,
    tableRef,
    headerWrapperRef,
    prefix,
    width: widthProp,
    affixHeader,
    affixHorizontalScrollbar,
    headerHeight,
    height: heightProp,
    autoHeight,
    minHeight,
    fillHeight,
    children,
    expandedRowKeys,
    showHeader,
    onTableResizeChange,
    onTableScroll
  } = props;

  const contentHeight = useRef(0);
  const contentWidth = useRef(0);
  const minScrollY = useRef(0);
  const scrollY = useRef(0);
  const scrollX = useRef(0);
  const minScrollX = useRef(0);
  const tableWidth = useRef(widthProp || 0);
  const tableHeight = useRef(heightProp || 0);
  const columnCount = useRef(0);
  const resizeObserver = useRef<ResizeObserver>();
  const containerResizeObserver = useRef<ResizeObserver>();
  const headerOffset = useRef<ElementOffset | null>(null);
  const tableOffset = useRef<ElementOffset | null>(null);

  const getRowHeight = useCallback(
    (rowData = {}) => {
      return typeof rowHeight === 'function' ? rowHeight(rowData) : rowHeight;
    },
    [rowHeight]
  );

  const calculateTableContextHeight = useCallback(() => {
    const prevContentHeight = contentHeight.current;
    const table = tableRef?.current as HTMLDivElement;
    const rows = table?.querySelectorAll(`.${prefix?.('row')}`) || [];
    const virtualized = table?.querySelectorAll('.virtualized')?.length > 0;

    const nextContentHeight = rows.length
      ? (
          Array.from(rows).map(
            (row: Element, index: number) => getHeight(row) || getRowHeight(data?.[index])
          ) as number[]
        ).reduce((x: number, y: number) => x + y)
      : 0;

    // After setting the affixHeader property, the height of the two headers should be subtracted.
    contentHeight.current = Math.round(
      nextContentHeight - (affixHeader ? headerHeight * 2 : headerHeight)
    );

    // Whether to show the horizontal scroll bar
    const hasHorizontalScrollbar = contentWidth.current > tableWidth.current;

    // The height of the table content area should be added to the height occupied by the horizontal scroll bar when autoHeight is set.
    if (autoHeight && hasHorizontalScrollbar) {
      contentHeight.current += SCROLLBAR_WIDTH;
    }

    const height = fillHeight ? tableHeight.current : heightProp;
    const tableBodyHeight = showHeader ? height - headerHeight : height;

    if (!autoHeight) {
      /**
       *  The purpose of subtracting SCROLLBAR_WIDTH is to keep the scroll bar from blocking the content part.
       *  But it will only be calculated when there is a horizontal scroll bar (contentWidth > tableWidth).
       */
      minScrollY.current =
        -(nextContentHeight - height) - (hasHorizontalScrollbar ? SCROLLBAR_WIDTH : 0);
    }

    // If the height of the content area is less than the height of the table, the vertical scroll bar is reset.
    if (nextContentHeight < height) {
      onTableScroll?.({ y: 0 });
    }

    const currentScrollTop = Math.abs(scrollY.current);

    // When Table is set to virtualized, the logic will be entered every time the wheel event is
    // triggered to avoid resetting the scroll bar after scrolling to the bottom, so add the SCROLLBAR_WIDTH value.
    const maxScrollTop = nextContentHeight + SCROLLBAR_WIDTH - tableBodyHeight;

    // If the top value of the current scroll is greater than the scrollable range,
    // keep the vertical scroll bar at the bottom.
    if (maxScrollTop > 0 && currentScrollTop > maxScrollTop) {
      if (virtualized) {
        onTableScroll?.({ y: (data?.length || 0) * getRowHeight() - tableBodyHeight });
      } else {
        onTableScroll?.({ y: maxScrollTop });
      }
    }

    if (prevContentHeight !== contentHeight.current) {
      onTableResizeChange?.(prevContentHeight, 'bodyHeightChanged');
    }
  }, [
    tableRef,
    prefix,
    affixHeader,
    headerHeight,
    autoHeight,
    fillHeight,
    heightProp,
    showHeader,
    getRowHeight,
    data,
    onTableScroll,
    onTableResizeChange
  ]);

  const setOffsetByAffix = useCallback(() => {
    const headerNode = headerWrapperRef?.current;
    if (isNumberOrTrue(affixHeader) && headerNode) {
      headerOffset.current = getOffset(headerNode);
    }

    if (isNumberOrTrue(affixHorizontalScrollbar) && tableRef?.current) {
      tableOffset.current = getOffset(tableRef?.current);
    }
  }, [affixHeader, affixHorizontalScrollbar, headerWrapperRef, tableRef]);

  const calculateTableContentWidth = useCallback(() => {
    const prevWidth = contentWidth.current;
    const prevColumnCount = columnCount.current;
    const table = tableRef?.current;
    const row = table?.querySelector(`.${prefix('row')}:not(.virtualized)`);
    const nextContentWidth = row ? getWidth(row) : 0;

    contentWidth.current = nextContentWidth - (autoHeight ? SCROLLBAR_WIDTH : 0);
    columnCount.current = row?.querySelectorAll(`.${prefix('cell')}`).length || 0;

    // The value of SCROLLBAR_WIDTH is subtracted so that the scroll bar does not block the content part.
    // There is no vertical scroll bar after autoHeight.
    minScrollX.current =
      -(nextContentWidth - tableWidth.current) - (autoHeight ? 0 : SCROLLBAR_WIDTH);

    /**
     * If the width of the content area and the number of columns change,
     * the horizontal scroll bar is reset.
     * fix: https://github.com/rsuite/rsuite/issues/2039
     */
    if (
      prevWidth > 0 &&
      prevWidth !== contentWidth.current &&
      prevColumnCount > 0 &&
      prevColumnCount !== columnCount.current
    ) {
      onTableResizeChange?.(prevWidth, 'bodyWidthChanged');
    }
  }, [autoHeight, onTableResizeChange, prefix, tableRef]);

  const calculateTableWidth = useCallback(
    (nextWidth?: number) => {
      const prevWidth = tableWidth.current;

      if (tableRef?.current) {
        tableWidth.current = nextWidth || getWidth(tableRef?.current);
      }

      if (prevWidth && prevWidth !== tableWidth.current) {
        scrollX.current = 0;
        onTableResizeChange?.(prevWidth, 'widthChanged');
      }

      setOffsetByAffix();
    },
    [onTableResizeChange, setOffsetByAffix, tableRef]
  );

  const calculateTableHeight = useCallback(
    (nextHeight?: number) => {
      const prevHeight = tableHeight.current;

      if (nextHeight) {
        tableHeight.current = nextHeight;
      } else if (tableRef?.current) {
        tableHeight.current = getHeight(tableRef.current.parentNode as Element);
      }

      if (prevHeight && prevHeight !== tableHeight.current) {
        onTableResizeChange?.(prevHeight, 'heightChanged');
      }
    },
    [onTableResizeChange, tableRef]
  );

  useMount(() => {
    calculateTableContextHeight();
    calculateTableContentWidth();
    calculateTableWidth();
    calculateTableHeight();
    setOffsetByAffix();

    containerResizeObserver.current = new ResizeObserver(entries => {
      calculateTableHeight(entries[0].contentRect.height);
    });
    containerResizeObserver.current.observe(tableRef?.current?.parentNode as Element);
    const changeTableWidthWhenResize = debounce(entries => {
      calculateTableWidth(entries[0].contentRect.width);
    }, 20);
    resizeObserver.current = new ResizeObserver(changeTableWidthWhenResize);
    resizeObserver.current.observe(tableRef?.current as Element);

    return () => {
      resizeObserver.current?.disconnect();
      containerResizeObserver.current?.disconnect();
    };
  });

  useUpdateLayoutEffect(() => {
    calculateTableHeight();
    calculateTableContextHeight();
  }, [fillHeight]);

  useUpdateLayoutEffect(() => {
    calculateTableWidth();
    calculateTableContentWidth();
    calculateTableContextHeight();
  }, [
    data,
    heightProp,
    contentHeight.current,
    expandedRowKeys,
    children,
    calculateTableContextHeight,
    calculateTableContentWidth
  ]);

  const setScrollY = useCallback((value: number) => {
    scrollY.current = value;
  }, []);

  const setScrollX = useCallback((value: number) => {
    scrollX.current = value;
  }, []);

  const getTableHeight = () => {
    if (fillHeight) {
      return tableHeight.current;
    }

    if (data?.length === 0 && autoHeight) {
      return heightProp;
    }

    return autoHeight ? Math.max(headerHeight + contentHeight.current, minHeight) : heightProp;
  };

  return {
    contentHeight,
    contentWidth,
    minScrollY,
    minScrollX,
    scrollY,
    scrollX,
    tableWidth,
    headerOffset,
    tableOffset,
    getTableHeight,
    setScrollY,
    setScrollX
  };
};

export default useTableDimension;
