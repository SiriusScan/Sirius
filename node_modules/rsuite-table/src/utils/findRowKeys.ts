import { RowKeyType, RowDataType } from '../@types/common';

export default function findRowKeys(
  rows: readonly RowDataType[],
  rowKey?: RowKeyType,
  expanded?: boolean
) {
  let keys: RowKeyType[] = [];

  if (!rowKey) {
    return keys;
  }

  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    if (item.children) {
      keys.push(item[rowKey]);
      keys = [...keys, ...findRowKeys(item.children, rowKey)];
    } else if (expanded) {
      keys.push(item[rowKey]);
    }
  }
  return keys;
}
