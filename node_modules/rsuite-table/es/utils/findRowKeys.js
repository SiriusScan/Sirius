export default function findRowKeys(rows, rowKey, expanded) {
  var keys = [];

  if (!rowKey) {
    return keys;
  }

  for (var i = 0; i < rows.length; i++) {
    var item = rows[i];

    if (item.children) {
      keys.push(item[rowKey]);
      keys = [].concat(keys, findRowKeys(item.children, rowKey));
    } else if (expanded) {
      keys.push(item[rowKey]);
    }
  }

  return keys;
}