import type { RowDataType } from '../@types/common';
/**
 * Flatten the data of a tree structure into a one-dimensional array.
 * @param treeData
 * @returns
 */
declare function flattenData(treeData: readonly RowDataType[]): RowDataType[];
export default flattenData;
