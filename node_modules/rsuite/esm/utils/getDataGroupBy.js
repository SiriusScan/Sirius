import _get from "lodash/get";
import { flattenTree } from '../utils/treeUtils';
var hasSymbol = typeof Symbol === 'function';
export var KEY_GROUP = hasSymbol ? Symbol('_$grouped') : '_$grouped';
export var KEY_GROUP_TITLE = 'groupTitle';
export default function getDataGroupBy(data, key, sort) {
  if (data === void 0) {
    data = [];
  }

  var tempData = {};
  var isSort = typeof sort === 'function';
  data.forEach(function (item) {
    // this will allow getting data using dot notation
    // i.e groupBy="country.name" as country will be a nested object
    // to the item and the name will be nested key to the country object
    // can be used with values in arrays, i.e groupBy="addresses.0.country.name"
    var groupByValue = _get(item, key, '');

    if (!tempData[groupByValue]) {
      tempData[groupByValue] = [];
    }

    tempData[groupByValue].push(item);
  });
  var nextData = Object.entries(tempData).map(function (_ref) {
    var _ref2;

    var groupTitle = _ref[0],
        children = _ref[1];
    return _ref2 = {
      children: isSort ? children.sort(sort(false)) : children
    }, _ref2[KEY_GROUP_TITLE] = groupTitle, _ref2[KEY_GROUP] = true, _ref2;
  });

  if (isSort) {
    nextData = nextData.sort(sort(true));
  }

  return flattenTree(nextData);
}