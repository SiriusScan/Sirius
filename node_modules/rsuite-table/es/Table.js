import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["affixHeader", "children", "classPrefix", "className", "data", "defaultSortType", "width", "expandedRowKeys", "defaultExpandAllRows", "defaultExpandedRowKeys", "style", "id", "isTree", "hover", "bordered", "cellBordered", "wordWrap", "loading", "locale", "showHeader", "sortColumn", "rowHeight", "sortType", "headerHeight", "minHeight", "height", "autoHeight", "fillHeight", "rtl", "translate3d", "rowKey", "virtualized", "rowClassName", "rowExpandedHeight", "disabledScroll", "affixHorizontalScrollbar", "loadAnimation", "shouldUpdateScroll", "renderRow", "renderRowExpanded", "renderLoading", "renderEmpty", "onSortColumn", "onScroll", "renderTreeToggle", "onRowClick", "onRowContextMenu", "onExpandChange", "onTouchStart", "onTouchMove", "onTouchEnd"],
    _excluded2 = ["depth"];
import React, { useState, useRef, useCallback, useImperativeHandle, useReducer } from 'react';
import { getTranslateDOMPositionXY } from 'dom-lib/translateDOMPositionXY';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import flatten from 'lodash/flatten';
import debounce from 'lodash/debounce';
import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';
import MouseArea from './MouseArea';
import Loader from './Loader';
import EmptyMessage from './EmptyMessage';
import TableContext from './TableContext';
import { SCROLLBAR_WIDTH, CELL_PADDING_HEIGHT, SORT_TYPE, EXPANDED_KEY, TREE_DEPTH } from './constants';
import { mergeCells, flattenData, isRTL, findRowKeys, findAllParents, shouldShowRowByExpanded, resetLeftForCells, useClassNames, useControlled, useUpdateEffect, useCellDescriptor, useTableDimension, useTableRows, useAffix, useScrollListener, usePosition, isSupportTouchEvent } from './utils';

/**
 * Filter those expanded nodes.
 * @param data
 * @param expandedRowKeys
 * @param rowKey
 * @returns
 */
var filterTreeData = function filterTreeData(data, expandedRowKeys, rowKey) {
  return flattenData(data).filter(function (rowData) {
    if (rowKey) {
      var parents = findAllParents(rowData, rowKey);

      var _expanded = shouldShowRowByExpanded(expandedRowKeys, parents);

      rowData[EXPANDED_KEY] = _expanded;
      rowData[TREE_DEPTH] = parents.length;
      return _expanded;
    }
  });
};

var DATA_PLACEHOLDER = [];
var Table = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var affixHeader = props.affixHeader,
      children = props.children,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'rs-table' : _props$classPrefix,
      className = props.className,
      _props$data = props.data,
      dataProp = _props$data === void 0 ? DATA_PLACEHOLDER : _props$data,
      _props$defaultSortTyp = props.defaultSortType,
      defaultSortType = _props$defaultSortTyp === void 0 ? SORT_TYPE.DESC : _props$defaultSortTyp,
      widthProp = props.width,
      expandedRowKeysProp = props.expandedRowKeys,
      defaultExpandAllRows = props.defaultExpandAllRows,
      defaultExpandedRowKeys = props.defaultExpandedRowKeys,
      style = props.style,
      id = props.id,
      isTree = props.isTree,
      _props$hover = props.hover,
      hover = _props$hover === void 0 ? true : _props$hover,
      bordered = props.bordered,
      cellBordered = props.cellBordered,
      wordWrap = props.wordWrap,
      loading = props.loading,
      _props$locale = props.locale,
      locale = _props$locale === void 0 ? {
    emptyMessage: 'No data found',
    loading: 'Loading...'
  } : _props$locale,
      _props$showHeader = props.showHeader,
      showHeader = _props$showHeader === void 0 ? true : _props$showHeader,
      sortColumn = props.sortColumn,
      _props$rowHeight = props.rowHeight,
      rowHeight = _props$rowHeight === void 0 ? 46 : _props$rowHeight,
      sortTypeProp = props.sortType,
      _props$headerHeight = props.headerHeight,
      headerHeightProp = _props$headerHeight === void 0 ? 40 : _props$headerHeight,
      _props$minHeight = props.minHeight,
      minHeight = _props$minHeight === void 0 ? 0 : _props$minHeight,
      _props$height = props.height,
      height = _props$height === void 0 ? 200 : _props$height,
      autoHeight = props.autoHeight,
      fillHeight = props.fillHeight,
      rtlProp = props.rtl,
      _props$translate3d = props.translate3d,
      translate3d = _props$translate3d === void 0 ? true : _props$translate3d,
      rowKey = props.rowKey,
      virtualized = props.virtualized,
      rowClassName = props.rowClassName,
      _props$rowExpandedHei = props.rowExpandedHeight,
      rowExpandedHeight = _props$rowExpandedHei === void 0 ? 100 : _props$rowExpandedHei,
      disabledScroll = props.disabledScroll,
      affixHorizontalScrollbar = props.affixHorizontalScrollbar,
      loadAnimation = props.loadAnimation,
      _props$shouldUpdateSc = props.shouldUpdateScroll,
      shouldUpdateScroll = _props$shouldUpdateSc === void 0 ? true : _props$shouldUpdateSc,
      renderRowProp = props.renderRow,
      renderRowExpandedProp = props.renderRowExpanded,
      renderLoading = props.renderLoading,
      renderEmpty = props.renderEmpty,
      onSortColumn = props.onSortColumn,
      onScroll = props.onScroll,
      renderTreeToggle = props.renderTreeToggle,
      onRowClick = props.onRowClick,
      onRowContextMenu = props.onRowContextMenu,
      onExpandChange = props.onExpandChange,
      onTouchStart = props.onTouchStart,
      onTouchMove = props.onTouchMove,
      onTouchEnd = props.onTouchEnd,
      rest = _objectWithoutPropertiesLoose(props, _excluded);

  var _useClassNames = useClassNames(classPrefix, typeof classPrefix !== 'undefined'),
      withClassPrefix = _useClassNames.withClassPrefix,
      mergeCls = _useClassNames.merge,
      prefix = _useClassNames.prefix; // Use `forceUpdate` to force the component to re-render after manipulating the DOM.


  var _useReducer = useReducer(function (x) {
    return x + 1;
  }, 0),
      forceUpdate = _useReducer[1];

  var _useControlled = useControlled(expandedRowKeysProp, defaultExpandAllRows ? findRowKeys(dataProp, rowKey, isFunction(renderRowExpandedProp)) : defaultExpandedRowKeys || []),
      expandedRowKeys = _useControlled[0],
      setExpandedRowKeys = _useControlled[1];

  var _useState = useState(function () {
    return isTree ? filterTreeData(dataProp, expandedRowKeys, rowKey) : dataProp;
  }),
      data = _useState[0],
      setData = _useState[1];

  if (isTree) {
    if (!rowKey) {
      throw new Error('The `rowKey` is required when set isTree');
    } else if (data.length > 0) {
      if (!data[0].hasOwnProperty(rowKey)) {
        throw new Error('The `rowKey` is not found in data');
      }
    }
  }

  var _useTableRows = useTableRows({
    data: dataProp,
    expandedRowKeys: expandedRowKeys,
    wordWrap: wordWrap,
    prefix: prefix
  }),
      tableRowsMaxHeight = _useTableRows.tableRowsMaxHeight,
      bindTableRowsRef = _useTableRows.bindTableRowsRef;

  var headerHeight = showHeader ? headerHeightProp : 0;
  var rtl = rtlProp || isRTL();

  var getRowHeight = function getRowHeight(rowData) {
    if (rowData === void 0) {
      rowData = {};
    }

    return typeof rowHeight === 'function' ? rowHeight(rowData) : rowHeight;
  };

  var translateDOMPositionXY = useRef(getTranslateDOMPositionXY({
    forceUseTransform: true,
    enable3DTransform: translate3d
  })); // Check for the existence of fixed columns in all column properties.

  var shouldFixedColumn = Array.from(flatten(children)).some(function (child) {
    var _child$props;

    return child === null || child === void 0 ? void 0 : (_child$props = child.props) === null || _child$props === void 0 ? void 0 : _child$props.fixed;
  }); // Check all column properties for the existence of rowSpan.

  var shouldRowSpanColumn = Array.from(flatten(children)).some(function (child) {
    var _child$props2;

    return child === null || child === void 0 ? void 0 : (_child$props2 = child.props) === null || _child$props2 === void 0 ? void 0 : _child$props2.rowSpan;
  });
  var visibleRows = useRef([]);
  var mouseAreaRef = useRef(null);
  var tableRef = useRef(null);
  var tableHeaderRef = useRef(null);
  var affixHeaderWrapperRef = useRef(null);
  var headerWrapperRef = useRef(null);
  var tableBodyRef = useRef(null);
  var wheelWrapperRef = useRef(null);
  var scrollbarXRef = useRef(null);
  var scrollbarYRef = useRef(null);

  var handleTableResizeChange = function handleTableResizeChange(_prevSize, event) {
    forceUpdate();
    /**
     * Reset the position of the scroll bar after the table size changes.
     */

    if (typeof shouldUpdateScroll === 'function') {
      onScrollTo(shouldUpdateScroll(event));
    } else if (shouldUpdateScroll) {
      var vertical = event === 'bodyHeightChanged';
      vertical ? onScrollTop(0) : onScrollLeft(0);
    }
  };

  var _useTableDimension = useTableDimension({
    data: dataProp,
    width: widthProp,
    rowHeight: rowHeight,
    tableRef: tableRef,
    headerWrapperRef: headerWrapperRef,
    prefix: prefix,
    affixHeader: affixHeader,
    affixHorizontalScrollbar: affixHorizontalScrollbar,
    headerHeight: headerHeight,
    height: height,
    minHeight: minHeight,
    autoHeight: autoHeight,
    fillHeight: fillHeight,
    children: children,
    expandedRowKeys: expandedRowKeys,
    showHeader: showHeader,
    onTableScroll: debounce(function (coords) {
      return onScrollTo(coords);
    }, 100),
    onTableResizeChange: handleTableResizeChange
  }),
      contentHeight = _useTableDimension.contentHeight,
      contentWidth = _useTableDimension.contentWidth,
      minScrollY = _useTableDimension.minScrollY,
      minScrollX = _useTableDimension.minScrollX,
      scrollY = _useTableDimension.scrollY,
      scrollX = _useTableDimension.scrollX,
      tableWidth = _useTableDimension.tableWidth,
      tableOffset = _useTableDimension.tableOffset,
      headerOffset = _useTableDimension.headerOffset,
      setScrollY = _useTableDimension.setScrollY,
      setScrollX = _useTableDimension.setScrollX,
      getTableHeight = _useTableDimension.getTableHeight;

  useAffix({
    getTableHeight: getTableHeight,
    contentHeight: contentHeight,
    affixHorizontalScrollbar: affixHorizontalScrollbar,
    affixHeader: affixHeader,
    tableOffset: tableOffset,
    headerOffset: headerOffset,
    headerHeight: headerHeight,
    scrollbarXRef: scrollbarXRef,
    affixHeaderWrapperRef: affixHeaderWrapperRef
  });

  var _usePosition = usePosition({
    data: dataProp,
    height: height,
    tableWidth: tableWidth,
    tableRef: tableRef,
    prefix: prefix,
    translateDOMPositionXY: translateDOMPositionXY,
    wheelWrapperRef: wheelWrapperRef,
    headerWrapperRef: headerWrapperRef,
    affixHeaderWrapperRef: affixHeaderWrapperRef,
    tableHeaderRef: tableHeaderRef,
    scrollX: scrollX,
    scrollY: scrollY,
    contentWidth: contentWidth,
    shouldFixedColumn: shouldFixedColumn
  }),
      forceUpdatePosition = _usePosition.forceUpdatePosition;

  var _useScrollListener = useScrollListener({
    rtl: rtl,
    data: dataProp,
    height: height,
    virtualized: virtualized,
    getTableHeight: getTableHeight,
    contentHeight: contentHeight,
    headerHeight: headerHeight,
    autoHeight: autoHeight,
    tableBodyRef: tableBodyRef,
    scrollbarXRef: scrollbarXRef,
    scrollbarYRef: scrollbarYRef,
    disabledScroll: disabledScroll,
    loading: loading,
    tableRef: tableRef,
    contentWidth: contentWidth,
    tableWidth: tableWidth,
    scrollY: scrollY,
    minScrollY: minScrollY,
    minScrollX: minScrollX,
    scrollX: scrollX,
    setScrollX: setScrollX,
    setScrollY: setScrollY,
    forceUpdatePosition: forceUpdatePosition,
    onScroll: onScroll,
    onTouchStart: onTouchStart,
    onTouchMove: onTouchMove,
    onTouchEnd: onTouchEnd
  }),
      isScrolling = _useScrollListener.isScrolling,
      onScrollHorizontal = _useScrollListener.onScrollHorizontal,
      onScrollVertical = _useScrollListener.onScrollVertical,
      onScrollBody = _useScrollListener.onScrollBody,
      onScrollTop = _useScrollListener.onScrollTop,
      onScrollLeft = _useScrollListener.onScrollLeft,
      onScrollTo = _useScrollListener.onScrollTo;

  var _useCellDescriptor = useCellDescriptor({
    children: children,
    rtl: rtl,
    mouseAreaRef: mouseAreaRef,
    tableRef: tableRef,
    minScrollX: minScrollX,
    scrollX: scrollX,
    tableWidth: tableWidth,
    headerHeight: headerHeight,
    showHeader: showHeader,
    sortType: sortTypeProp,
    defaultSortType: defaultSortType,
    sortColumn: sortColumn,
    prefix: prefix,
    onSortColumn: onSortColumn,
    // Force table update after column width change, so scrollbar re-renders.
    onHeaderCellResize: forceUpdate,
    rowHeight: rowHeight
  }),
      headerCells = _useCellDescriptor.headerCells,
      bodyCells = _useCellDescriptor.bodyCells,
      allColumnsWidth = _useCellDescriptor.allColumnsWidth,
      hasCustomTreeCol = _useCellDescriptor.hasCustomTreeCol;

  var colCounts = useRef((headerCells === null || headerCells === void 0 ? void 0 : headerCells.length) || 0);
  useUpdateEffect(function () {
    setData(isTree ? filterTreeData(dataProp, expandedRowKeys, rowKey) : dataProp);
  }, [dataProp, expandedRowKeys, rowKey, isTree]);
  useUpdateEffect(function () {
    if ((headerCells === null || headerCells === void 0 ? void 0 : headerCells.length) !== colCounts.current) {
      onScrollLeft(0);
      colCounts.current = (headerCells === null || headerCells === void 0 ? void 0 : headerCells.length) || 0;
    }
  }, [children]);
  useImperativeHandle(ref, function () {
    return {
      get root() {
        return tableRef.current;
      },

      get body() {
        return wheelWrapperRef.current;
      },

      scrollTop: onScrollTop,
      scrollLeft: onScrollLeft
    };
  });
  var rowWidth = allColumnsWidth > tableWidth.current ? allColumnsWidth : tableWidth.current; // Whether to show vertical scroll bar

  var hasVerticalScrollbar = !autoHeight && contentHeight.current > getTableHeight() - headerHeight; // Whether to show the horizontal scroll bar

  var hasHorizontalScrollbar = contentWidth.current > tableWidth.current;
  var classes = mergeCls(className, withClassPrefix({
    bordered: bordered,
    hover: hover && !shouldRowSpanColumn,
    loading: loading,
    treetable: isTree,
    'word-wrap': wordWrap,
    'cell-bordered': cellBordered
  }));

  var styles = _extends({
    width: widthProp || 'auto',
    height: getTableHeight()
  }, style);

  var renderRowExpanded = useCallback(function (rowData) {
    var styles = {
      height: rowExpandedHeight
    };

    if (typeof renderRowExpandedProp === 'function') {
      return /*#__PURE__*/React.createElement("div", {
        className: prefix('row-expanded'),
        style: styles
      }, renderRowExpandedProp(rowData));
    }

    return null;
  }, [prefix, renderRowExpandedProp, rowExpandedHeight]);

  var renderRow = function renderRow(props, cells, shouldRenderExpandedRow, rowData) {
    var depth = props.depth,
        restRowProps = _objectWithoutPropertiesLoose(props, _excluded2);

    if (typeof rowClassName === 'function') {
      restRowProps.className = rowClassName(rowData);
    } else {
      restRowProps.className = rowClassName;
    }

    var rowStyles = _extends({}, props === null || props === void 0 ? void 0 : props.style);

    var rowRight = 0;

    if (rtl && contentWidth.current > tableWidth.current) {
      rowRight = tableWidth.current - contentWidth.current;
      rowStyles.right = rowRight;
    }

    var rowNode = null; // IF there are fixed columns, add a fixed group

    if (shouldFixedColumn && contentWidth.current > tableWidth.current) {
      var fixedLeftCells = [];
      var fixedRightCells = [];
      var scrollCells = [];
      var fixedLeftCellGroupWidth = 0;
      var fixedRightCellGroupWidth = 0;

      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var _cell$props = cell.props,
            fixed = _cell$props.fixed,
            width = _cell$props.width;
        var isFixedStart = fixed === 'left' || fixed === true;
        var isFixedEnd = fixed === 'right';

        if (rtl) {
          isFixedStart = fixed === 'right';
          isFixedEnd = fixed === 'left' || fixed === true;
        }

        if (isFixedStart) {
          fixedLeftCells.push(cell);
          fixedLeftCellGroupWidth += width;
        } else if (isFixedEnd) {
          fixedRightCells.push(cell);
          fixedRightCellGroupWidth += width;
        } else {
          scrollCells.push(cell);
        }
      }

      if (hasVerticalScrollbar && fixedRightCellGroupWidth) {
        fixedRightCellGroupWidth += SCROLLBAR_WIDTH;
      }

      rowNode = /*#__PURE__*/React.createElement(React.Fragment, null, fixedLeftCellGroupWidth ? /*#__PURE__*/React.createElement(CellGroup, {
        fixed: "left",
        height: props.isHeaderRow ? props.headerHeight : props.height,
        width: fixedLeftCellGroupWidth,
        style: rtl ? {
          right: tableWidth.current - fixedLeftCellGroupWidth - rowRight
        } : undefined
      }, mergeCells(resetLeftForCells(fixedLeftCells))) : null, /*#__PURE__*/React.createElement(CellGroup, null, mergeCells(scrollCells)), fixedRightCellGroupWidth ? /*#__PURE__*/React.createElement(CellGroup, {
        fixed: "right",
        style: rtl ? {
          right: 0 - rowRight
        } : {
          left: tableWidth.current - fixedRightCellGroupWidth
        },
        height: props.isHeaderRow ? props.headerHeight : props.height,
        width: fixedRightCellGroupWidth
      }, mergeCells(resetLeftForCells(fixedRightCells, hasVerticalScrollbar ? SCROLLBAR_WIDTH : 0))) : null, shouldRenderExpandedRow && renderRowExpanded(rowData));
    } else {
      rowNode = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(CellGroup, null, mergeCells(cells)), shouldRenderExpandedRow && renderRowExpanded(rowData));
    }

    return /*#__PURE__*/React.createElement(Row, _extends({}, restRowProps, {
      "data-depth": depth,
      style: rowStyles
    }), renderRowProp ? renderRowProp(rowNode, rowData) : rowNode);
  };

  var renderTableHeader = function renderTableHeader(headerCells, rowWidth) {
    var top = typeof affixHeader === 'number' ? affixHeader : 0;
    var rowProps = {
      'aria-rowindex': 1,
      rowRef: tableHeaderRef,
      width: rowWidth,
      height: getRowHeight(),
      headerHeight: headerHeight,
      isHeaderRow: true,
      top: 0
    };
    var fixedStyle = {
      position: 'fixed',
      overflow: 'hidden',
      height: headerHeight,
      width: tableWidth.current,
      top: top
    }; // Affix header

    var header = /*#__PURE__*/React.createElement("div", {
      className: prefix('affix-header'),
      style: fixedStyle,
      ref: affixHeaderWrapperRef
    }, renderRow(rowProps, headerCells));
    return /*#__PURE__*/React.createElement(React.Fragment, null, (affixHeader === 0 || affixHeader) && header, /*#__PURE__*/React.createElement("div", {
      role: "rowgroup",
      className: prefix('header-row-wrapper'),
      ref: headerWrapperRef
    }, renderRow(rowProps, headerCells)));
  };

  var shouldRenderExpandedRow = useCallback(function (rowData) {
    if (isFunction(renderRowExpandedProp) && !isTree && rowKey && expandedRowKeys.some(function (key) {
      return key === rowData[rowKey];
    })) {
      return true;
    }

    return false;
  }, [expandedRowKeys, isTree, renderRowExpandedProp, rowKey]);
  var bindRowClick = useCallback(function (rowData) {
    return function (event) {
      onRowClick === null || onRowClick === void 0 ? void 0 : onRowClick(rowData, event);
    };
  }, [onRowClick]);
  var bindRowContextMenu = useCallback(function (rowData) {
    return function (event) {
      onRowContextMenu === null || onRowContextMenu === void 0 ? void 0 : onRowContextMenu(rowData, event);
    };
  }, [onRowContextMenu]);
  var handleTreeToggle = useCallback(function (treeRowKey, _rowIndex, rowData) {
    var open = false;
    var nextExpandedRowKeys = [];

    for (var i = 0; i < expandedRowKeys.length; i++) {
      var key = expandedRowKeys[i];

      if (key === treeRowKey) {
        open = true;
      } else {
        nextExpandedRowKeys.push(key);
      }
    }

    if (!open) {
      nextExpandedRowKeys.push(treeRowKey);
    }

    setExpandedRowKeys(nextExpandedRowKeys);
    onExpandChange === null || onExpandChange === void 0 ? void 0 : onExpandChange(!open, rowData);
  }, [expandedRowKeys, onExpandChange, setExpandedRowKeys]);
  /**
   * Records the status of merged rows.
   * { cellKey: [count,index]}
   */

  var rowSpanState = useRef({});

  var renderRowData = function renderRowData(bodyCells, rowData, props, shouldRenderExpandedRow) {
    var hasChildren = isTree && rowData.children && Array.isArray(rowData.children);
    var nextRowKey = rowKey && typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.key;

    var rowProps = _extends({}, props, {
      key: nextRowKey,
      'aria-rowindex': props.key + 2,
      rowRef: bindTableRowsRef(props.key, rowData),
      onClick: bindRowClick(rowData),
      onContextMenu: bindRowContextMenu(rowData)
    });

    var expanded = expandedRowKeys.some(function (key) {
      return rowKey && key === rowData[rowKey];
    });
    var cells = [];

    for (var i = 0; i < bodyCells.length; i++) {
      var _cell$props2, _cell$props2$rowSpan, _rowSpanState$current, _cell$props3, _rowSpanState$current2;

      var cell = bodyCells[i];
      var rowSpan = (_cell$props2 = cell.props) === null || _cell$props2 === void 0 ? void 0 : (_cell$props2$rowSpan = _cell$props2.rowSpan) === null || _cell$props2$rowSpan === void 0 ? void 0 : _cell$props2$rowSpan.call(_cell$props2, rowData);

      var _rowHeight = rowSpan ? rowSpan * (props.height || 46) : props.height;

      var _cellKey = cell.props.dataKey || i; // Record the cell state of the merged row


      if (((_rowSpanState$current = rowSpanState.current[_cellKey]) === null || _rowSpanState$current === void 0 ? void 0 : _rowSpanState$current[1]) > 0) {
        rowSpanState.current[_cellKey][1] -= 1; // Restart counting when merged to the last cell.

        if (rowSpanState.current[_cellKey][1] === 0) {
          rowSpanState.current[_cellKey][0] = 0;
        }
      }

      if (rowSpan) {
        // The state of the initial merged cell
        rowSpanState.current[_cellKey] = [rowSpan, rowSpan];
        rowProps.rowSpan = rowSpan;
        rowProps.style = {
          overflow: 'inherit'
        };
      } // Cells marked as deleted when checking for merged cell.


      var removedCell = (_cell$props3 = cell.props) !== null && _cell$props3 !== void 0 && _cell$props3.rowSpan && !rowSpan && ((_rowSpanState$current2 = rowSpanState.current[_cellKey]) === null || _rowSpanState$current2 === void 0 ? void 0 : _rowSpanState$current2[0]) !== 0 ? true : false;
      cells.push( /*#__PURE__*/React.cloneElement(cell, {
        hasChildren: hasChildren,
        rowData: rowData,
        wordWrap: wordWrap,
        height: _rowHeight,
        rowIndex: props.key,
        depth: props.depth,
        renderTreeToggle: renderTreeToggle,
        onTreeToggle: handleTreeToggle,
        rowKey: nextRowKey,
        expanded: expanded,
        rowSpan: rowSpan,
        removed: removedCell
      }));
    }

    return renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
  };

  var renderScrollbar = function renderScrollbar() {
    var height = getTableHeight();

    if (disabledScroll) {
      return null;
    }

    var scrollbars = [];

    if (hasHorizontalScrollbar) {
      scrollbars.push( /*#__PURE__*/React.createElement(Scrollbar, {
        key: "scrollbar",
        tableId: id,
        style: {
          width: tableWidth.current
        },
        length: tableWidth.current,
        onScroll: onScrollHorizontal,
        scrollLength: contentWidth.current,
        ref: scrollbarXRef
      }));
    }

    if (hasVerticalScrollbar) {
      scrollbars.push( /*#__PURE__*/React.createElement(Scrollbar, {
        vertical: true,
        key: "vertical-scrollbar",
        tableId: id,
        length: height - headerHeight,
        onScroll: onScrollVertical,
        scrollLength: contentHeight.current,
        ref: scrollbarYRef
      }));
    }

    return scrollbars;
  };

  var renderTableBody = function renderTableBody(bodyCells, rowWidth) {
    var _visibleRows$current;

    var height = getTableHeight();
    var bodyHeight = height - headerHeight;
    var bodyStyles = {
      top: headerHeight,
      height: bodyHeight
    };
    var contentHeight = 0;
    var topHideHeight = 0;
    var bottomHideHeight = 0;
    visibleRows.current = [];

    if (data) {
      var top = 0; // Row position

      var minTop = Math.abs(scrollY.current);
      var maxTop = minTop + height + rowExpandedHeight;
      var isCustomRowHeight = typeof rowHeight === 'function';
      var isUncertainHeight = !!renderRowExpandedProp || isCustomRowHeight || wordWrap; // If virtualized is enabled and the row height in the Table is variable,
      // you need to loop through the data to get the height of each row.

      if (isUncertainHeight && virtualized || !virtualized) {
        // Avoid white screens on the top and bottom of the table when touching and scrolling on the mobile terminal.
        // So supplement the display data row.
        if (isSupportTouchEvent()) {
          var coveredHeight = height * 3;
          minTop = Math.max(minTop - coveredHeight, 0);
          maxTop = maxTop + coveredHeight;
        }

        for (var index = 0; index < data.length; index++) {
          var _rowData = data[index];
          var maxHeight = tableRowsMaxHeight[index];
          var shouldRender = shouldRenderExpandedRow(_rowData);
          var nextRowHeight = 0;

          if (typeof rowHeight === 'function') {
            nextRowHeight = rowHeight(_rowData);
          } else {
            nextRowHeight = maxHeight ? Math.max(maxHeight + CELL_PADDING_HEIGHT, rowHeight) : rowHeight;

            if (shouldRender) {
              nextRowHeight += rowExpandedHeight;
            }
          }

          contentHeight += nextRowHeight;
          var rowProps = {
            key: index,
            top: top,
            width: rowWidth,
            depth: _rowData[TREE_DEPTH],
            height: nextRowHeight
          };
          top += nextRowHeight;

          if (virtualized && !wordWrap) {
            if (top + nextRowHeight < minTop) {
              topHideHeight += nextRowHeight;
              continue;
            } else if (top > maxTop) {
              bottomHideHeight += nextRowHeight;
              continue;
            }
          }

          visibleRows.current.push(renderRowData(bodyCells, _rowData, rowProps, shouldRender));
        }
      } else {
        /** virtualized */
        // If the row height of the Table is fixed, it is directly calculated by the row height and the number of rows,
        // thereby reducing the performance cost of traversing all data.
        var _nextRowHeight = getRowHeight();

        var startIndex = Math.max(Math.floor(minTop / _nextRowHeight), 0);
        var endIndex = Math.min(startIndex + Math.ceil(bodyHeight / _nextRowHeight) + 5, data.length); // Avoid white screens on the top and bottom of the table when touching and scrolling on the mobile terminal.
        // So supplement the display data row.

        if (isSupportTouchEvent()) {
          var coveredCount = Math.floor(height / _nextRowHeight * 3);
          startIndex = Math.max(startIndex - coveredCount, 0);
          endIndex = Math.min(endIndex + coveredCount, data.length);
        }

        contentHeight = data.length * _nextRowHeight;
        topHideHeight = startIndex * _nextRowHeight;
        bottomHideHeight = (data.length - endIndex) * _nextRowHeight;

        for (var _index = startIndex; _index < endIndex; _index++) {
          var _rowData2 = data[_index];
          var _rowProps = {
            key: _index,
            depth: _rowData2[TREE_DEPTH],
            top: _index * _nextRowHeight,
            width: rowWidth,
            height: _nextRowHeight
          };
          visibleRows.current.push(renderRowData(bodyCells, _rowData2, _rowProps, false));
        }
      }
    }

    var wheelStyles = {
      position: 'absolute',
      height: contentHeight,
      minHeight: height,
      pointerEvents: isScrolling ? 'none' : undefined
    };
    var topRowStyles = {
      height: topHideHeight
    };
    var bottomRowStyles = {
      height: bottomHideHeight
    };
    return /*#__PURE__*/React.createElement("div", {
      ref: tableBodyRef,
      role: "rowgroup",
      className: prefix('body-row-wrapper'),
      style: bodyStyles,
      onScroll: onScrollBody
    }, /*#__PURE__*/React.createElement("div", {
      style: wheelStyles,
      className: prefix('body-wheel-area'),
      ref: wheelWrapperRef
    }, topHideHeight ? /*#__PURE__*/React.createElement(Row, {
      style: topRowStyles,
      className: "virtualized"
    }) : null, visibleRows.current, bottomHideHeight ? /*#__PURE__*/React.createElement(Row, {
      style: bottomRowStyles,
      className: "virtualized"
    }) : null), /*#__PURE__*/React.createElement(EmptyMessage, {
      locale: locale,
      renderEmpty: renderEmpty,
      addPrefix: prefix,
      loading: !!((_visibleRows$current = visibleRows.current) !== null && _visibleRows$current !== void 0 && _visibleRows$current.length) || loading
    }), renderScrollbar(), /*#__PURE__*/React.createElement(Loader, {
      locale: locale,
      loadAnimation: loadAnimation,
      loading: loading,
      addPrefix: prefix,
      renderLoading: renderLoading
    }));
  };

  var contextValue = React.useMemo(function () {
    return {
      classPrefix: classPrefix,
      translateDOMPositionXY: translateDOMPositionXY.current,
      rtl: rtl,
      isTree: isTree,
      hasCustomTreeCol: hasCustomTreeCol
    };
  }, [classPrefix, hasCustomTreeCol, isTree, rtl]);
  return /*#__PURE__*/React.createElement(TableContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: isTree ? 'treegrid' : 'grid' // The aria-rowcount is specified on the element with the table.
    // Its value is an integer equal to the total number of rows available, including header rows.
    ,
    "aria-rowcount": data.length + 1,
    "aria-colcount": colCounts.current,
    "aria-busy": loading
  }, rest, {
    className: classes,
    style: styles,
    ref: tableRef
  }), showHeader && renderTableHeader(headerCells, rowWidth), children && renderTableBody(bodyCells, rowWidth), showHeader && /*#__PURE__*/React.createElement(MouseArea, {
    ref: mouseAreaRef,
    addPrefix: prefix,
    headerHeight: headerHeight,
    height: getTableHeight()
  })));
});
Table.displayName = 'Table';
Table.propTypes = {
  autoHeight: PropTypes.bool,
  fillHeight: PropTypes.bool,
  affixHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  affixHorizontalScrollbar: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  bordered: PropTypes.bool,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.any,
  cellBordered: PropTypes.bool,
  data: PropTypes.array,
  defaultExpandAllRows: PropTypes.bool,
  defaultExpandedRowKeys: PropTypes.array,
  defaultSortType: PropTypes.any,
  disabledScroll: PropTypes.bool,
  expandedRowKeys: PropTypes.array,
  hover: PropTypes.bool,
  height: PropTypes.number,
  headerHeight: PropTypes.number,
  locale: PropTypes.object,
  loading: PropTypes.bool,
  loadAnimation: PropTypes.bool,
  minHeight: PropTypes.number,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  renderTreeToggle: PropTypes.func,
  renderRowExpanded: PropTypes.func,
  renderRow: PropTypes.func,
  rowExpandedHeight: PropTypes.number,
  renderEmpty: PropTypes.func,
  renderLoading: PropTypes.func,
  rowClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  rtl: PropTypes.bool,
  style: PropTypes.object,
  sortColumn: PropTypes.string,
  sortType: PropTypes.any,
  showHeader: PropTypes.bool,
  shouldUpdateScroll: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  translate3d: PropTypes.bool,
  wordWrap: PropTypes.any,
  width: PropTypes.number,
  virtualized: PropTypes.bool,
  isTree: PropTypes.bool,
  onRowClick: PropTypes.func,
  onRowContextMenu: PropTypes.func,
  onScroll: PropTypes.func,
  onSortColumn: PropTypes.func,
  onExpandChange: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func
};
export default Table;