import { useCallback, useRef } from 'react';
import addStyle from 'dom-lib/addStyle';
import { SCROLLBAR_WIDTH } from '../constants';
import toggleClass from './toggleClass';
import useUpdateEffect from './useUpdateEffect';
import isSupportTouchEvent from './isSupportTouchEvent';

/**
 * Update the position of the table according to the scrolling information of the table.
 * @param props
 * @returns
 */
var usePosition = function usePosition(props) {
  var data = props.data,
      height = props.height,
      tableWidth = props.tableWidth,
      tableRef = props.tableRef,
      prefix = props.prefix,
      translateDOMPositionXY = props.translateDOMPositionXY,
      wheelWrapperRef = props.wheelWrapperRef,
      headerWrapperRef = props.headerWrapperRef,
      affixHeaderWrapperRef = props.affixHeaderWrapperRef,
      tableHeaderRef = props.tableHeaderRef,
      scrollX = props.scrollX,
      scrollY = props.scrollY,
      contentWidth = props.contentWidth,
      shouldFixedColumn = props.shouldFixedColumn;
  var duration = useRef(0);
  var bezier = useRef('linear');
  var getScrollCellGroups = useCallback(function () {
    var _tableRef$current;

    return ((_tableRef$current = tableRef.current) === null || _tableRef$current === void 0 ? void 0 : _tableRef$current.querySelectorAll("." + prefix('cell-group-scroll'))) || [];
  }, [prefix, tableRef]);
  var getFixedLeftCellGroups = useCallback(function () {
    var _tableRef$current2;

    return (_tableRef$current2 = tableRef.current) === null || _tableRef$current2 === void 0 ? void 0 : _tableRef$current2.querySelectorAll("." + prefix('cell-group-fixed-left'));
  }, [prefix, tableRef]);
  var getFixedRightCellGroups = useCallback(function () {
    var _tableRef$current3;

    return (_tableRef$current3 = tableRef.current) === null || _tableRef$current3 === void 0 ? void 0 : _tableRef$current3.querySelectorAll("." + prefix('cell-group-fixed-right'));
  }, [prefix, tableRef]);
  var updateWheelElementPosition = useCallback(function (fixedCell) {
    if (wheelWrapperRef !== null && wheelWrapperRef !== void 0 && wheelWrapperRef.current) {
      // The animation when the mobile device touches and scrolls.
      var wheelStyle = isSupportTouchEvent() ? {
        'transition-duration': duration.current + "ms",
        'transition-timing-function': bezier.current
      } : {};
      translateDOMPositionXY.current(wheelStyle, fixedCell ? 0 : scrollX.current, scrollY.current);
      addStyle(wheelWrapperRef.current, wheelStyle);
    }
  }, [scrollX, scrollY, translateDOMPositionXY, wheelWrapperRef]);
  var updatePositionByFixedCell = useCallback(function () {
    var wheelGroupStyle = {};
    var scrollGroups = getScrollCellGroups();
    var fixedLeftGroups = getFixedLeftCellGroups();
    var fixedRightGroups = getFixedRightCellGroups();
    translateDOMPositionXY.current(wheelGroupStyle, scrollX.current, 0);
    var scrollArrayGroups = Array.from(scrollGroups);

    for (var i = 0; i < scrollArrayGroups.length; i++) {
      var group = scrollArrayGroups[i];
      addStyle(group, wheelGroupStyle);
    }

    updateWheelElementPosition(true);
    var leftShadowClassName = prefix('cell-group-left-shadow');
    var rightShadowClassName = prefix('cell-group-right-shadow');
    var showLeftShadow = scrollX.current < 0;
    var showRightShadow = tableWidth.current - contentWidth.current - SCROLLBAR_WIDTH !== scrollX.current;
    toggleClass(fixedLeftGroups, leftShadowClassName, showLeftShadow);
    toggleClass(fixedRightGroups, rightShadowClassName, showRightShadow);
  }, [contentWidth, getFixedLeftCellGroups, getFixedRightCellGroups, getScrollCellGroups, updateWheelElementPosition, prefix, scrollX, tableWidth, translateDOMPositionXY]);
  /**
   * Update the position of the table according to the scrolling information of the table.
   * @param nextDuration CSS transition-duration
   * @param nextBezier CSS transition-timing-function
   */

  var updatePosition = useCallback(function (nextDuration, nextBezier) {
    if (nextDuration) {
      duration.current = nextDuration;
    }

    if (nextBezier) {
      bezier.current = nextBezier;
    } // When there are fixed columns.


    if (shouldFixedColumn) {
      updatePositionByFixedCell();
    } else {
      var _affixHeaderElement$h;

      var headerStyle = {};
      translateDOMPositionXY.current(headerStyle, scrollX.current, 0);
      var headerElement = headerWrapperRef === null || headerWrapperRef === void 0 ? void 0 : headerWrapperRef.current;
      var affixHeaderElement = affixHeaderWrapperRef === null || affixHeaderWrapperRef === void 0 ? void 0 : affixHeaderWrapperRef.current;
      updateWheelElementPosition();
      headerElement && addStyle(headerElement, headerStyle);

      if (affixHeaderElement !== null && affixHeaderElement !== void 0 && (_affixHeaderElement$h = affixHeaderElement.hasChildNodes) !== null && _affixHeaderElement$h !== void 0 && _affixHeaderElement$h.call(affixHeaderElement)) {
        addStyle(affixHeaderElement === null || affixHeaderElement === void 0 ? void 0 : affixHeaderElement.firstChild, headerStyle);
      }
    }

    if (tableHeaderRef !== null && tableHeaderRef !== void 0 && tableHeaderRef.current) {
      toggleClass(tableHeaderRef.current, prefix('cell-group-shadow'), scrollY.current < 0);
    }
  }, [affixHeaderWrapperRef, updateWheelElementPosition, headerWrapperRef, prefix, scrollX, scrollY, shouldFixedColumn, tableHeaderRef, translateDOMPositionXY, updatePositionByFixedCell]);
  useUpdateEffect(function () {
    if (scrollY.current !== 0) {
      updatePosition();
    }
  }, [height, data]);
  return {
    forceUpdatePosition: updatePosition
  };
};

export default usePosition;