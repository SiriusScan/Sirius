import { PARENT_KEY } from '../constants';

/**
 * Find all parent nodes of a node
 */
export default function findAllParents(rowData, rowKey) {
  var parents = [];

  if (!rowData) {
    return parents;
  }

  function findParent(data) {
    if (data) {
      parents.push(data[rowKey]);

      if (data[PARENT_KEY]) {
        findParent(data[PARENT_KEY]);
      }
    }
  }

  findParent(rowData[PARENT_KEY]);
  return parents;
}