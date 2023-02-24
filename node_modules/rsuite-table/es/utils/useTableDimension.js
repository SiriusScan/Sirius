import { useRef, useCallback } from 'react';
import getWidth from 'dom-lib/getWidth';
import getHeight from 'dom-lib/getHeight';
import getOffset from 'dom-lib/getOffset';
import { SCROLLBAR_WIDTH } from '../constants';
import { ResizeObserver } from '@juggle/resize-observer';
import useMount from './useMount';
import useUpdateLayoutEffect from './useUpdateLayoutEffect';
import isNumberOrTrue from './isNumberOrTrue';
import debounce from 'lodash/debounce';

/**
 * The dimension information of the table,
 * including the height, width, scrollable distance and the coordinates of the scroll handle, etc.
 * @param props
 * @returns
 */
var useTableDimension = function useTableDimension(props) {
  var data = props.data,
      rowHeight = props.rowHeight,
      tableRef = props.tableRef,
      headerWrapperRef = props.headerWrapperRef,
      prefix = props.prefix,
      widthProp = props.width,
      affixHeader = props.affixHeader,
      affixHorizontalScrollbar = props.affixHorizontalScrollbar,
      headerHeight = props.headerHeight,
      heightProp = props.height,
      autoHeight = props.autoHeight,
      minHeight = props.minHeight,
      fillHeight = props.fillHeight,
      children = props.children,
      expandedRowKeys = props.expandedRowKeys,
      showHeader = props.showHeader,
      onTableResizeChange = props.onTableResizeChange,
      onTableScroll = props.onTableScroll;
  var contentHeight = useRef(0);
  var contentWidth = useRef(0);
  var minScrollY = useRef(0);
  var scrollY = useRef(0);
  var scrollX = useRef(0);
  var minScrollX = useRef(0);
  var tableWidth = useRef(widthProp || 0);
  var tableHeight = useRef(heightProp || 0);
  var columnCount = useRef(0);
  var resizeObserver = useRef();
  var containerResizeObserver = useRef();
  var headerOffset = useRef(null);
  var tableOffset = useRef(null);
  var getRowHeight = useCallback(function (rowData) {
    if (rowData === void 0) {
      rowData = {};
    }

    return typeof rowHeight === 'function' ? rowHeight(rowData) : rowHeight;
  }, [rowHeight]);
  var calculateTableContextHeight = useCallback(function () {
    var _table$querySelectorA;

    var prevContentHeight = contentHeight.current;
    var table = tableRef === null || tableRef === void 0 ? void 0 : tableRef.current;
    var rows = (table === null || table === void 0 ? void 0 : table.querySelectorAll("." + (prefix === null || prefix === void 0 ? void 0 : prefix('row')))) || [];
    var virtualized = (table === null || table === void 0 ? void 0 : (_table$querySelectorA = table.querySelectorAll('.virtualized')) === null || _table$querySelectorA === void 0 ? void 0 : _table$querySelectorA.length) > 0;
    var nextContentHeight = rows.length ? Array.from(rows).map(function (row, index) {
      return getHeight(row) || getRowHeight(data === null || data === void 0 ? void 0 : data[index]);
    }).reduce(function (x, y) {
      return x + y;
    }) : 0; // After setting the affixHeader property, the height of the two headers should be subtracted.

    contentHeight.current = Math.round(nextContentHeight - (affixHeader ? headerHeight * 2 : headerHeight)); // Whether to show the horizontal scroll bar

    var hasHorizontalScrollbar = contentWidth.current > tableWidth.current; // The height of the table content area should be added to the height occupied by the horizontal scroll bar when autoHeight is set.

    if (autoHeight && hasHorizontalScrollbar) {
      contentHeight.current += SCROLLBAR_WIDTH;
    }

    var height = fillHeight ? tableHeight.current : heightProp;
    var tableBodyHeight = showHeader ? height - headerHeight : height;

    if (!autoHeight) {
      /**
       *  The purpose of subtracting SCROLLBAR_WIDTH is to keep the scroll bar from blocking the content part.
       *  But it will only be calculated when there is a horizontal scroll bar (contentWidth > tableWidth).
       */
      minScrollY.current = -(nextContentHeight - height) - (hasHorizontalScrollbar ? SCROLLBAR_WIDTH : 0);
    } // If the height of the content area is less than the height of the table, the vertical scroll bar is reset.


    if (nextContentHeight < height) {
      onTableScroll === null || onTableScroll === void 0 ? void 0 : onTableScroll({
        y: 0
      });
    }

    var currentScrollTop = Math.abs(scrollY.current); // When Table is set to virtualized, the logic will be entered every time the wheel event is
    // triggered to avoid resetting the scroll bar after scrolling to the bottom, so add the SCROLLBAR_WIDTH value.

    var maxScrollTop = nextContentHeight + SCROLLBAR_WIDTH - tableBodyHeight; // If the top value of the current scroll is greater than the scrollable range,
    // keep the vertical scroll bar at the bottom.

    if (maxScrollTop > 0 && currentScrollTop > maxScrollTop) {
      if (virtualized) {
        onTableScroll === null || onTableScroll === void 0 ? void 0 : onTableScroll({
          y: ((data === null || data === void 0 ? void 0 : data.length) || 0) * getRowHeight() - tableBodyHeight
        });
      } else {
        onTableScroll === null || onTableScroll === void 0 ? void 0 : onTableScroll({
          y: maxScrollTop
        });
      }
    }

    if (prevContentHeight !== contentHeight.current) {
      onTableResizeChange === null || onTableResizeChange === void 0 ? void 0 : onTableResizeChange(prevContentHeight, 'bodyHeightChanged');
    }
  }, [tableRef, prefix, affixHeader, headerHeight, autoHeight, fillHeight, heightProp, showHeader, getRowHeight, data, onTableScroll, onTableResizeChange]);
  var setOffsetByAffix = useCallback(function () {
    var headerNode = headerWrapperRef === null || headerWrapperRef === void 0 ? void 0 : headerWrapperRef.current;

    if (isNumberOrTrue(affixHeader) && headerNode) {
      headerOffset.current = getOffset(headerNode);
    }

    if (isNumberOrTrue(affixHorizontalScrollbar) && tableRef !== null && tableRef !== void 0 && tableRef.current) {
      tableOffset.current = getOffset(tableRef === null || tableRef === void 0 ? void 0 : tableRef.current);
    }
  }, [affixHeader, affixHorizontalScrollbar, headerWrapperRef, tableRef]);
  var calculateTableContentWidth = useCallback(function () {
    var prevWidth = contentWidth.current;
    var prevColumnCount = columnCount.current;
    var table = tableRef === null || tableRef === void 0 ? void 0 : tableRef.current;
    var row = table === null || table === void 0 ? void 0 : table.querySelector("." + prefix('row') + ":not(.virtualized)");
    var nextContentWidth = row ? getWidth(row) : 0;
    contentWidth.current = nextContentWidth - (autoHeight ? SCROLLBAR_WIDTH : 0);
    columnCount.current = (row === null || row === void 0 ? void 0 : row.querySelectorAll("." + prefix('cell')).length) || 0; // The value of SCROLLBAR_WIDTH is subtracted so that the scroll bar does not block the content part.
    // There is no vertical scroll bar after autoHeight.

    minScrollX.current = -(nextContentWidth - tableWidth.current) - (autoHeight ? 0 : SCROLLBAR_WIDTH);
    /**
     * If the width of the content area and the number of columns change,
     * the horizontal scroll bar is reset.
     * fix: https://github.com/rsuite/rsuite/issues/2039
     */

    if (prevWidth > 0 && prevWidth !== contentWidth.current && prevColumnCount > 0 && prevColumnCount !== columnCount.current) {
      onTableResizeChange === null || onTableResizeChange === void 0 ? void 0 : onTableResizeChange(prevWidth, 'bodyWidthChanged');
    }
  }, [autoHeight, onTableResizeChange, prefix, tableRef]);
  var calculateTableWidth = useCallback(function (nextWidth) {
    var prevWidth = tableWidth.current;

    if (tableRef !== null && tableRef !== void 0 && tableRef.current) {
      tableWidth.current = nextWidth || getWidth(tableRef === null || tableRef === void 0 ? void 0 : tableRef.current);
    }

    if (prevWidth && prevWidth !== tableWidth.current) {
      scrollX.current = 0;
      onTableResizeChange === null || onTableResizeChange === void 0 ? void 0 : onTableResizeChange(prevWidth, 'widthChanged');
    }

    setOffsetByAffix();
  }, [onTableResizeChange, setOffsetByAffix, tableRef]);
  var calculateTableHeight = useCallback(function (nextHeight) {
    var prevHeight = tableHeight.current;

    if (nextHeight) {
      tableHeight.current = nextHeight;
    } else if (tableRef !== null && tableRef !== void 0 && tableRef.current) {
      tableHeight.current = getHeight(tableRef.current.parentNode);
    }

    if (prevHeight && prevHeight !== tableHeight.current) {
      onTableResizeChange === null || onTableResizeChange === void 0 ? void 0 : onTableResizeChange(prevHeight, 'heightChanged');
    }
  }, [onTableResizeChange, tableRef]);
  useMount(function () {
    var _tableRef$current;

    calculateTableContextHeight();
    calculateTableContentWidth();
    calculateTableWidth();
    calculateTableHeight();
    setOffsetByAffix();
    containerResizeObserver.current = new ResizeObserver(function (entries) {
      calculateTableHeight(entries[0].contentRect.height);
    });
    containerResizeObserver.current.observe(tableRef === null || tableRef === void 0 ? void 0 : (_tableRef$current = tableRef.current) === null || _tableRef$current === void 0 ? void 0 : _tableRef$current.parentNode);
    var changeTableWidthWhenResize = debounce(function (entries) {
      calculateTableWidth(entries[0].contentRect.width);
    }, 20);
    resizeObserver.current = new ResizeObserver(changeTableWidthWhenResize);
    resizeObserver.current.observe(tableRef === null || tableRef === void 0 ? void 0 : tableRef.current);
    return function () {
      var _resizeObserver$curre, _containerResizeObser;

      (_resizeObserver$curre = resizeObserver.current) === null || _resizeObserver$curre === void 0 ? void 0 : _resizeObserver$curre.disconnect();
      (_containerResizeObser = containerResizeObserver.current) === null || _containerResizeObser === void 0 ? void 0 : _containerResizeObser.disconnect();
    };
  });
  useUpdateLayoutEffect(function () {
    calculateTableHeight();
    calculateTableContextHeight();
  }, [fillHeight]);
  useUpdateLayoutEffect(function () {
    calculateTableWidth();
    calculateTableContentWidth();
    calculateTableContextHeight();
  }, [data, heightProp, contentHeight.current, expandedRowKeys, children, calculateTableContextHeight, calculateTableContentWidth]);
  var setScrollY = useCallback(function (value) {
    scrollY.current = value;
  }, []);
  var setScrollX = useCallback(function (value) {
    scrollX.current = value;
  }, []);

  var getTableHeight = function getTableHeight() {
    if (fillHeight) {
      return tableHeight.current;
    }

    if ((data === null || data === void 0 ? void 0 : data.length) === 0 && autoHeight) {
      return heightProp;
    }

    return autoHeight ? Math.max(headerHeight + contentHeight.current, minHeight) : heightProp;
  };

  return {
    contentHeight: contentHeight,
    contentWidth: contentWidth,
    minScrollY: minScrollY,
    minScrollX: minScrollX,
    scrollY: scrollY,
    scrollX: scrollX,
    tableWidth: tableWidth,
    headerOffset: headerOffset,
    tableOffset: tableOffset,
    getTableHeight: getTableHeight,
    setScrollY: setScrollY,
    setScrollX: setScrollX
  };
};

export default useTableDimension;