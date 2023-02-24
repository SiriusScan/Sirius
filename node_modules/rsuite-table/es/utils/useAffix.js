import { useRef, useCallback, useEffect } from 'react';
import getHeight from 'dom-lib/getHeight';
import addStyle from 'dom-lib/addStyle';
import removeStyle from 'dom-lib/removeStyle';
import on from 'dom-lib/on';
import toggleClass from './toggleClass';
import isNumberOrTrue from './isNumberOrTrue';
import useUpdateEffect from './useUpdateEffect';

var useAffix = function useAffix(props) {
  var getTableHeight = props.getTableHeight,
      contentHeight = props.contentHeight,
      affixHorizontalScrollbar = props.affixHorizontalScrollbar,
      affixHeader = props.affixHeader,
      tableOffset = props.tableOffset,
      headerOffset = props.headerOffset,
      headerHeight = props.headerHeight,
      scrollbarXRef = props.scrollbarXRef,
      affixHeaderWrapperRef = props.affixHeaderWrapperRef;
  var scrollListener = useRef();
  var handleAffixHorizontalScrollbar = useCallback(function () {
    var _tableOffset$current, _scrollbarXRef$curren;

    var scrollY = window.scrollY || window.pageYOffset;
    var windowHeight = getHeight(window);
    var height = getTableHeight();
    var bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;
    var offsetTop = ((_tableOffset$current = tableOffset.current) === null || _tableOffset$current === void 0 ? void 0 : _tableOffset$current.top) || 0;
    var fixedScrollbar = scrollY + windowHeight < height + (offsetTop + bottom) && scrollY + windowHeight - headerHeight > offsetTop + bottom;

    if (scrollbarXRef !== null && scrollbarXRef !== void 0 && (_scrollbarXRef$curren = scrollbarXRef.current) !== null && _scrollbarXRef$curren !== void 0 && _scrollbarXRef$curren.root) {
      toggleClass(scrollbarXRef.current.root, 'fixed', fixedScrollbar);

      if (fixedScrollbar) {
        addStyle(scrollbarXRef.current.root, 'bottom', bottom + "px");
      } else {
        removeStyle(scrollbarXRef.current.root, 'bottom');
      }
    }
  }, [affixHorizontalScrollbar, headerHeight, scrollbarXRef, getTableHeight, tableOffset]);
  var handleAffixTableHeader = useCallback(function () {
    var _headerOffset$current;

    var top = typeof affixHeader === 'number' ? affixHeader : 0;
    var scrollY = window.scrollY || window.pageYOffset;
    var offsetTop = ((_headerOffset$current = headerOffset.current) === null || _headerOffset$current === void 0 ? void 0 : _headerOffset$current.top) || 0;
    var fixedHeader = scrollY - (offsetTop - top) >= 0 && scrollY < offsetTop - top + contentHeight.current;

    if (affixHeaderWrapperRef.current) {
      toggleClass(affixHeaderWrapperRef.current, 'fixed', fixedHeader);
    }
  }, [affixHeader, affixHeaderWrapperRef, contentHeight, headerOffset]);
  var handleWindowScroll = useCallback(function () {
    if (isNumberOrTrue(affixHeader)) {
      handleAffixTableHeader();
    }

    if (isNumberOrTrue(affixHorizontalScrollbar)) {
      handleAffixHorizontalScrollbar();
    }
  }, [affixHeader, affixHorizontalScrollbar, handleAffixTableHeader, handleAffixHorizontalScrollbar]);
  /**
   * Update the position of the fixed element after the height of the table changes.
   * fix: https://github.com/rsuite/rsuite/issues/1716
   */

  useUpdateEffect(handleWindowScroll, [getTableHeight]);
  useEffect(function () {
    if (isNumberOrTrue(affixHeader) || isNumberOrTrue(affixHorizontalScrollbar)) {
      scrollListener.current = on(window, 'scroll', handleWindowScroll);
    }

    return function () {
      var _scrollListener$curre;

      (_scrollListener$curre = scrollListener.current) === null || _scrollListener$curre === void 0 ? void 0 : _scrollListener$curre.off();
    };
  }, [affixHeader, affixHorizontalScrollbar, handleWindowScroll]);
};

export default useAffix;