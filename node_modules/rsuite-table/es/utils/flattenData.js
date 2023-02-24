import _extends from "@babel/runtime/helpers/esm/extends";
import { PARENT_KEY } from '../constants';

/**
 * Flatten the data of a tree structure into a one-dimensional array.
 * @param treeData
 * @returns
 */
function flattenData(treeData) {
  var flattenItems = [];

  function loop(treeData, parentNode) {
    if (!Array.isArray(treeData)) {
      return;
    }

    treeData.forEach(function (rowData) {
      rowData[PARENT_KEY] = parentNode;
      flattenItems.push(_extends({}, rowData));

      if (rowData.children) {
        loop(rowData.children, rowData);
      }
    });
  }

  loop(treeData, null);
  return flattenItems;
}

export default flattenData;