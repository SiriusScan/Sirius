"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = getDataGroupBy;
exports.KEY_GROUP_TITLE = exports.KEY_GROUP = void 0;

var _get2 = _interopRequireDefault(require("lodash/get"));

var _treeUtils = require("../utils/treeUtils");

var hasSymbol = typeof Symbol === 'function';
var KEY_GROUP = hasSymbol ? Symbol('_$grouped') : '_$grouped';
exports.KEY_GROUP = KEY_GROUP;
var KEY_GROUP_TITLE = 'groupTitle';
exports.KEY_GROUP_TITLE = KEY_GROUP_TITLE;

function getDataGroupBy(data, key, sort) {
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
    var groupByValue = (0, _get2.default)(item, key, '');

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

  return (0, _treeUtils.flattenTree)(nextData);
}