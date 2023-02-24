import { useState, useCallback, useRef } from 'react';
import getHeight from 'dom-lib/getHeight';
import useUpdateLayoutEffect from './useUpdateLayoutEffect';
import useMount from './useMount';
import isEmpty from 'lodash/isEmpty';

/**
 * The row information of the table, get the DOM of all rows, and summarize the row height.
 * @param props
 * @returns
 */
var useTableRows = function useTableRows(props) {
  var prefix = props.prefix,
      wordWrap = props.wordWrap,
      data = props.data,
      expandedRowKeys = props.expandedRowKeys;

  var _useState = useState([]),
      tableRowsMaxHeight = _useState[0],
      setTableRowsMaxHeight = _useState[1];

  var tableRows = useRef({});

  var bindTableRowsRef = function bindTableRowsRef(index, rowData) {
    return function (ref) {
      if (ref) {
        tableRows.current[index] = [ref, rowData];
      }
    };
  };

  var calculateRowMaxHeight = useCallback(function () {
    if (wordWrap) {
      var nextTableRowsMaxHeight = [];
      var curTableRows = Object.values(tableRows.current);

      for (var i = 0; i < curTableRows.length; i++) {
        var _curTableRows$i = curTableRows[i],
            row = _curTableRows$i[0];

        if (row) {
          var cells = row.querySelectorAll("." + prefix('cell-wrap')) || [];
          var cellArray = Array.from(cells);
          var maxHeight = 0;

          for (var j = 0; j < cellArray.length; j++) {
            var cell = cellArray[j];
            var h = getHeight(cell);
            maxHeight = Math.max(maxHeight, h);
          }

          nextTableRowsMaxHeight.push(maxHeight);
        }
      } // Can't perform a React state update on an unmounted component


      if (!isEmpty(tableRows.current)) {
        setTableRowsMaxHeight(nextTableRowsMaxHeight);
      }
    }
  }, [prefix, wordWrap]);
  useMount(function () {
    setTimeout(calculateRowMaxHeight, 1);
  });
  useUpdateLayoutEffect(function () {
    /**
     * After the data is updated, the height of the cell DOM needs to be re-acquired,
     * and what is often obtained is not the latest DOM that has been rendered.
     * So use `setTimeout` to delay obtaining the height of the cell DOM.
     * TODO: To be improved
     */
    setTimeout(calculateRowMaxHeight, 1);
  }, [data, expandedRowKeys]);
  return {
    bindTableRowsRef: bindTableRowsRef,
    tableRowsMaxHeight: tableRowsMaxHeight,
    tableRows: tableRows
  };
};

export default useTableRows;