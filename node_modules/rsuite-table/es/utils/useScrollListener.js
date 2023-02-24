import { useRef, useCallback, useState, useEffect } from 'react';
import WheelHandler from 'dom-lib/WheelHandler';
import scrollLeft from 'dom-lib/scrollLeft';
import scrollTop from 'dom-lib/scrollTop';
import on from 'dom-lib/on';
import removeStyle from 'dom-lib/removeStyle';
import { requestAnimationTimeout, cancelAnimationTimeout } from './requestAnimationTimeout';
import useUpdateEffect from './useUpdateEffect';
import useMount from './useMount';
import { SCROLLBAR_WIDTH, TRANSITION_DURATION, BEZIER } from '../constants';
import isSupportTouchEvent from './isSupportTouchEvent';
import flushSync from './flushSync'; // Inertial sliding start time threshold

var momentumTimeThreshold = 300; // Inertial sliding start vertical distance threshold

var momentumYThreshold = 15;

/**
 * Calculate the distance of inertial sliding.
 */
var momentum = function momentum(current, start, duration) {
  // Inertial sliding acceleration.
  var deceleration = 0.003;
  var distance = current - start;
  var speed = 2 * Math.abs(distance) / duration;
  var destination = current + speed / deceleration * (distance < 0 ? -1 : 1);
  return {
    delta: current - destination,
    duration: TRANSITION_DURATION,
    bezier: BEZIER
  };
};
/**
 * Add scroll, touch, and wheel monitoring events to the table,
 * and update the scroll position of the table.
 * @param props
 * @returns
 */


var useScrollListener = function useScrollListener(props) {
  var data = props.data,
      autoHeight = props.autoHeight,
      tableBodyRef = props.tableBodyRef,
      scrollbarXRef = props.scrollbarXRef,
      scrollbarYRef = props.scrollbarYRef,
      disabledScroll = props.disabledScroll,
      loading = props.loading,
      tableRef = props.tableRef,
      contentWidth = props.contentWidth,
      tableWidth = props.tableWidth,
      scrollY = props.scrollY,
      minScrollY = props.minScrollY,
      minScrollX = props.minScrollX,
      scrollX = props.scrollX,
      setScrollX = props.setScrollX,
      setScrollY = props.setScrollY,
      virtualized = props.virtualized,
      forceUpdatePosition = props.forceUpdatePosition,
      onScroll = props.onScroll,
      onTouchMove = props.onTouchMove,
      onTouchStart = props.onTouchStart,
      onTouchEnd = props.onTouchEnd,
      height = props.height,
      getTableHeight = props.getTableHeight,
      contentHeight = props.contentHeight,
      headerHeight = props.headerHeight,
      rtl = props.rtl;
  var wheelListener = useRef();
  var touchStartListener = useRef();
  var touchMoveListener = useRef();
  var touchEndListener = useRef();

  var _useState = useState(false),
      isScrolling = _useState[0],
      setScrolling = _useState[1];

  var touchX = useRef(0);
  var touchY = useRef(0);
  var disableEventsTimeoutId = useRef(null);
  var isTouching = useRef(false); // The start time within the inertial sliding range.

  var momentumStartTime = useRef(0); // The vertical starting value within the inertial sliding range.

  var momentumStartY = useRef(0);
  var shouldHandleWheelX = useCallback(function (delta) {
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }

    return true;
  }, [disabledScroll, loading]);
  var shouldHandleWheelY = useCallback(function (delta) {
    if (delta === 0 || disabledScroll || loading || autoHeight) {
      return false;
    }

    if (typeof scrollY.current === 'number' && typeof minScrollY.current === 'number') {
      return delta >= 0 && scrollY.current > minScrollY.current || delta < 0 && scrollY.current < 0;
    }
  }, [autoHeight, disabledScroll, loading, minScrollY, scrollY]);
  var debounceScrollEndedCallback = useCallback(function () {
    disableEventsTimeoutId.current = null; // Forces the end of scrolling to be prioritized so that virtualized long lists can update rendering.
    // There will be no scrolling white screen.

    flushSync(function () {
      return setScrolling(false);
    });
  }, []);
  /**
   * Triggered when scrolling, including: wheel/touch/scroll
   * @param deltaX
   * @param deltaY
   * @param momentumOptions The configuration of inertial scrolling is used for the touch event.
   */

  var handleWheel = useCallback(function (deltaX, deltaY, momentumOptions, event) {
    if (!tableRef.current) {
      return;
    }

    var nextScrollX = contentWidth.current <= tableWidth.current ? 0 : scrollX.current - deltaX;
    var nextScrollY = scrollY.current - deltaY;
    var y = Math.min(0, nextScrollY < minScrollY.current ? minScrollY.current : nextScrollY);
    var x = Math.min(0, nextScrollX < minScrollX.current ? minScrollX.current : nextScrollX);
    setScrollX(x);
    setScrollY(y);
    onScroll === null || onScroll === void 0 ? void 0 : onScroll(Math.abs(x), Math.abs(y));

    if (virtualized) {
      // Add a state to the table during virtualized scrolling.
      // Make it set CSS `pointer-events:none` on the DOM to avoid wrong event interaction.
      flushSync(function () {
        return setScrolling(true);
      });

      if (disableEventsTimeoutId.current) {
        cancelAnimationTimeout(disableEventsTimeoutId.current);
      }

      disableEventsTimeoutId.current = requestAnimationTimeout(debounceScrollEndedCallback, // When momentum is enabled, set a delay of 50ms rendering.
      momentumOptions !== null && momentumOptions !== void 0 && momentumOptions.duration ? 50 : 0);
    } // When the user clicks on the scrollbar, the scrollbar will be moved to the clicked position.


    if ((event === null || event === void 0 ? void 0 : event.type) === 'click') {
      /**
       * With virtualized enabled, the list will be re-rendered on every scroll.
       * Update the position of the rendered list with a delay.
       * fix: https://github.com/rsuite/rsuite/issues/2378
       */
      setTimeout(function () {
        return forceUpdatePosition(momentumOptions === null || momentumOptions === void 0 ? void 0 : momentumOptions.duration, momentumOptions === null || momentumOptions === void 0 ? void 0 : momentumOptions.bezier);
      }, 0);
      return;
    }

    forceUpdatePosition(momentumOptions === null || momentumOptions === void 0 ? void 0 : momentumOptions.duration, momentumOptions === null || momentumOptions === void 0 ? void 0 : momentumOptions.bezier);
  }, [tableRef, contentWidth, tableWidth, scrollX, scrollY, minScrollY, minScrollX, setScrollX, setScrollY, onScroll, forceUpdatePosition, virtualized, debounceScrollEndedCallback]);
  var onWheel = useCallback(function (deltaX, deltaY, momentumOptions) {
    var _scrollbarXRef$curren, _scrollbarXRef$curren2, _scrollbarYRef$curren, _scrollbarYRef$curren2;

    handleWheel(deltaX, deltaY, momentumOptions);
    (_scrollbarXRef$curren = scrollbarXRef.current) === null || _scrollbarXRef$curren === void 0 ? void 0 : (_scrollbarXRef$curren2 = _scrollbarXRef$curren.onWheelScroll) === null || _scrollbarXRef$curren2 === void 0 ? void 0 : _scrollbarXRef$curren2.call(_scrollbarXRef$curren, deltaX);
    (_scrollbarYRef$curren = scrollbarYRef.current) === null || _scrollbarYRef$curren === void 0 ? void 0 : (_scrollbarYRef$curren2 = _scrollbarYRef$curren.onWheelScroll) === null || _scrollbarYRef$curren2 === void 0 ? void 0 : _scrollbarYRef$curren2.call(_scrollbarYRef$curren, deltaY, momentumOptions !== null && momentumOptions !== void 0 && momentumOptions.duration ? true : false);
  }, [handleWheel, scrollbarXRef, scrollbarYRef]);
  var wheelHandler = useRef(); // Stop unending scrolling and remove transition

  var stopScroll = useCallback(function () {
    var _tableBodyRef$current, _scrollbarYRef$curren3;

    var wheelElement = (_tableBodyRef$current = tableBodyRef.current) === null || _tableBodyRef$current === void 0 ? void 0 : _tableBodyRef$current.querySelector('.rs-table-body-wheel-area');
    var handleElement = (_scrollbarYRef$curren3 = scrollbarYRef.current) === null || _scrollbarYRef$curren3 === void 0 ? void 0 : _scrollbarYRef$curren3.handle;
    var transitionCSS = ['transition-duration', 'transition-timing-function'];

    if (!virtualized && wheelElement) {
      // Get the current translate position.
      var matrix = window.getComputedStyle(wheelElement).getPropertyValue('transform');
      var offsetY = Math.round(+matrix.split(')')[0].split(', ')[5]);
      setScrollY(offsetY);
    }

    if (wheelElement) {
      removeStyle(wheelElement, transitionCSS);
    }

    if (handleElement) {
      removeStyle(handleElement, transitionCSS);
    }
  }, [scrollbarYRef, setScrollY, tableBodyRef, virtualized]); // Handle the Touch event and initialize it when touchstart is triggered.

  var handleTouchStart = useCallback(function (event) {
    var _event$touches$ = event.touches[0],
        pageX = _event$touches$.pageX,
        pageY = _event$touches$.pageY;
    touchX.current = pageX;
    touchY.current = pageY;
    momentumStartTime.current = new Date().getTime();
    momentumStartY.current = scrollY.current;
    isTouching.current = true;
    onTouchStart === null || onTouchStart === void 0 ? void 0 : onTouchStart(event); // Stop unfinished scrolling when Touch starts.

    stopScroll();
  }, [onTouchStart, scrollY, stopScroll]); // Handle the Touch event and update the scroll when touchmove is triggered.

  var handleTouchMove = useCallback(function (event) {
    if (!isTouching.current) {
      return;
    }

    var _event$touches$2 = event.touches[0],
        pageX = _event$touches$2.pageX,
        pageY = _event$touches$2.pageY;
    var deltaX = touchX.current - pageX;
    var deltaY = autoHeight ? 0 : touchY.current - pageY;

    if (!shouldHandleWheelY(deltaY) && !shouldHandleWheelX(deltaX)) {
      return;
    }
    /**
     * Prevent the default touch event when the table is scrollable.
     * fix: https://github.com/rsuite/rsuite-table/commit/21785fc18f430519ab5885c44540d9ffc30de366#commitcomment-36236425
     */


    if (!autoHeight && shouldHandleWheelY(deltaY)) {
      var _event$preventDefault;

      (_event$preventDefault = event.preventDefault) === null || _event$preventDefault === void 0 ? void 0 : _event$preventDefault.call(event);
    }

    var now = new Date().getTime();
    onWheel(deltaX, deltaY);
    touchX.current = pageX;
    touchY.current = pageY; // Record the offset value and time under the condition of triggering inertial scrolling.

    if (now - momentumStartTime.current > momentumTimeThreshold) {
      momentumStartY.current = scrollY.current;
      momentumStartTime.current = now;
    }

    onTouchMove === null || onTouchMove === void 0 ? void 0 : onTouchMove(event);
  }, [autoHeight, onWheel, onTouchMove, scrollY, shouldHandleWheelX, shouldHandleWheelY]);
  var handleTouchEnd = useCallback(function (event) {
    if (!isTouching.current) {
      return;
    }

    isTouching.current = false;
    var touchDuration = new Date().getTime() - momentumStartTime.current;
    var absDeltaY = Math.abs(scrollY.current - momentumStartY.current); // Enable inertial sliding.

    if (touchDuration < momentumTimeThreshold && absDeltaY > momentumYThreshold) {
      var _momentum = momentum(scrollY.current, momentumStartY.current, touchDuration),
          delta = _momentum.delta,
          duration = _momentum.duration,
          bezier = _momentum.bezier;

      onWheel(0, delta, {
        duration: duration,
        bezier: bezier
      });
      onTouchEnd === null || onTouchEnd === void 0 ? void 0 : onTouchEnd(event);
    }
  }, [onWheel, onTouchEnd, scrollY]);
  /**
   * When the user uses the tab key in the Table, the onScroll event is triggered,
   * and the scroll bar position should be updated at the same time.
   * https://github.com/rsuite/rsuite/issues/234
   */

  var onScrollBody = useCallback(function (event) {
    if (event.target !== tableBodyRef.current) {
      return;
    }

    var left = scrollLeft(event.target);
    var top = scrollTop(event.target);

    if (top === 0 && left === 0) {
      return;
    }

    onWheel(left, top);
    scrollLeft(event.target, 0);
    scrollTop(event.target, 0);
  }, [onWheel, tableBodyRef]);
  var getControlledScrollTopValue = useCallback(function (value) {
    if (autoHeight) {
      return [0, 0];
    }

    var height = getTableHeight(); // The maximum range of scrolling value is judged.

    value = Math.min(value, Math.max(0, contentHeight.current - (height - headerHeight))); // The value is a value of the theoretical scroll position of the table,
    // and the scrollY coordinate value and the value of the scroll bar position are calculated by value.

    return [-value, value / contentHeight.current * (height - headerHeight)];
  }, [autoHeight, contentHeight, getTableHeight, headerHeight]);

  var rerender = function rerender() {
    setScrolling(true);
    setTimeout(function () {
      if (tableBodyRef.current) {
        setScrolling(false);
      }
    }, 0);
  };

  var getControlledScrollLeftValue = function getControlledScrollLeftValue(value) {
    // The maximum range of scrolling value is judged.
    value = Math.min(value, Math.max(0, contentWidth.current - tableWidth.current));
    return [-value, value / contentWidth.current * tableWidth.current];
  };

  var onScrollTop = function onScrollTop(top) {
    var _scrollbarYRef$curren4, _scrollbarYRef$curren5;

    if (top === void 0) {
      top = 0;
    }

    var _getControlledScrollT = getControlledScrollTopValue(top),
        nextScrollY = _getControlledScrollT[0],
        handleScrollY = _getControlledScrollT[1];

    var height = getTableHeight();

    if (!loading && nextScrollY !== scrollY.current) {
      onScroll === null || onScroll === void 0 ? void 0 : onScroll(Math.abs(scrollX.current), Math.abs(nextScrollY));
    }

    setScrollY(nextScrollY);
    scrollbarYRef === null || scrollbarYRef === void 0 ? void 0 : (_scrollbarYRef$curren4 = scrollbarYRef.current) === null || _scrollbarYRef$curren4 === void 0 ? void 0 : (_scrollbarYRef$curren5 = _scrollbarYRef$curren4.resetScrollBarPosition) === null || _scrollbarYRef$curren5 === void 0 ? void 0 : _scrollbarYRef$curren5.call(_scrollbarYRef$curren4, handleScrollY);
    forceUpdatePosition();
    /**
     * After calling `scrollTop`, a white screen will appear when `virtualized` is true.
     * The reason is that the coordinates of the DOM are directly manipulated,
     * but the component is not re-rendered. Need to call `rerender`.
     * Fix: rsuite#1044
     */

    if (virtualized && contentHeight.current > height) {
      rerender();
    }
  };

  var onScrollLeft = function onScrollLeft(left) {
    var _scrollbarXRef$curren3, _scrollbarXRef$curren4;

    if (left === void 0) {
      left = 0;
    }

    var _getControlledScrollL = getControlledScrollLeftValue(left),
        nextScrollX = _getControlledScrollL[0],
        scrollbarX = _getControlledScrollL[1];

    setScrollX(nextScrollX);
    !loading && (onScroll === null || onScroll === void 0 ? void 0 : onScroll(Math.abs(nextScrollX), Math.abs(scrollY.current)));
    scrollbarXRef === null || scrollbarXRef === void 0 ? void 0 : (_scrollbarXRef$curren3 = scrollbarXRef.current) === null || _scrollbarXRef$curren3 === void 0 ? void 0 : (_scrollbarXRef$curren4 = _scrollbarXRef$curren3.resetScrollBarPosition) === null || _scrollbarXRef$curren4 === void 0 ? void 0 : _scrollbarXRef$curren4.call(_scrollbarXRef$curren3, scrollbarX);
    forceUpdatePosition();
  };

  var onScrollTo = function onScrollTo(coord) {
    var _ref = coord || {},
        x = _ref.x,
        y = _ref.y;

    if (typeof x === 'number') {
      onScrollLeft(x);
    }

    if (typeof y === 'number') {
      onScrollTop(y);
    }
  };

  useUpdateEffect(function () {
    if (scrollY.current !== 0) {
      onScrollTop(Math.abs(scrollY.current));
    }
  }, [height, data]);
  var releaseListeners = useCallback(function () {
    var _wheelListener$curren, _touchStartListener$c, _touchMoveListener$cu, _touchEndListener$cur;

    wheelHandler.current = null;
    (_wheelListener$curren = wheelListener.current) === null || _wheelListener$curren === void 0 ? void 0 : _wheelListener$curren.off();
    (_touchStartListener$c = touchStartListener.current) === null || _touchStartListener$c === void 0 ? void 0 : _touchStartListener$c.off();
    (_touchMoveListener$cu = touchMoveListener.current) === null || _touchMoveListener$cu === void 0 ? void 0 : _touchMoveListener$cu.off();
    (_touchEndListener$cur = touchEndListener.current) === null || _touchEndListener$cur === void 0 ? void 0 : _touchEndListener$cur.off();
  }, []);
  useEffect(function () {
    var options = {
      passive: false
    };
    var tableBody = tableBodyRef.current;

    if (tableBody) {
      // Reset the listener after props is updated.
      releaseListeners();
      wheelHandler.current = new WheelHandler(onWheel, shouldHandleWheelX, shouldHandleWheelY, false);
      wheelListener.current = on(tableBody, 'wheel', wheelHandler.current.onWheel, options);

      if (isSupportTouchEvent()) {
        touchStartListener.current = on(tableBody, 'touchstart', handleTouchStart, options);
        touchMoveListener.current = on(tableBody, 'touchmove', handleTouchMove, options);
        touchEndListener.current = on(tableBody, 'touchend', handleTouchEnd, options);
      }
    }

    return releaseListeners;
  }, [handleTouchEnd, handleTouchMove, handleTouchStart, onWheel, releaseListeners, shouldHandleWheelX, shouldHandleWheelY, tableBodyRef]);
  useMount(function () {
    if (rtl) {
      var _scrollbarXRef$curren5, _scrollbarXRef$curren6;

      // Initialize scroll position
      setScrollX(tableWidth.current - contentWidth.current - SCROLLBAR_WIDTH);
      scrollbarXRef === null || scrollbarXRef === void 0 ? void 0 : (_scrollbarXRef$curren5 = scrollbarXRef.current) === null || _scrollbarXRef$curren5 === void 0 ? void 0 : (_scrollbarXRef$curren6 = _scrollbarXRef$curren5.resetScrollBarPosition) === null || _scrollbarXRef$curren6 === void 0 ? void 0 : _scrollbarXRef$curren6.call(_scrollbarXRef$curren5, -scrollX.current);
      forceUpdatePosition();
    }
  });
  var onScrollHorizontal = useCallback(function (delta) {
    return handleWheel(delta, 0);
  }, [handleWheel]);
  var onScrollVertical = useCallback(function (delta, event) {
    return handleWheel(0, delta, undefined, event);
  }, [handleWheel]);
  return {
    isScrolling: isScrolling,
    onScrollHorizontal: onScrollHorizontal,
    onScrollVertical: onScrollVertical,
    onScrollBody: onScrollBody,
    onScrollTop: onScrollTop,
    onScrollLeft: onScrollLeft,
    onScrollTo: onScrollTo
  };
};

export default useScrollListener;