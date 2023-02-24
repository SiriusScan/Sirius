import { PARENT_KEY } from '../constants';
import type { RowKeyType, RowDataType } from '../@types/common';

/**
 * Find all parent nodes of a node
 */
export default function findAllParents(rowData: RowDataType, rowKey: RowKeyType) {
  const parents: RowKeyType[] = [];

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
