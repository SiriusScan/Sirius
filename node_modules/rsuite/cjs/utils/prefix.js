"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.prefix = prefix;
exports.default = exports.defaultClassPrefix = exports.getClassNamePrefix = exports.globalKey = void 0;

var _classnames = _interopRequireDefault(require("classnames"));

var _curry = _interopRequireDefault(require("lodash/curry"));

var globalKey = 'rs-';
exports.globalKey = globalKey;

var getClassNamePrefix = function getClassNamePrefix() {
  // TODO: A prefix that can be replaced at runtime.
  return globalKey;
};

exports.getClassNamePrefix = getClassNamePrefix;

var defaultClassPrefix = function defaultClassPrefix(name) {
  return "" + getClassNamePrefix() + name;
};

exports.defaultClassPrefix = defaultClassPrefix;

function prefix(pre, className) {
  if (!pre || !className) {
    return '';
  }

  if (Array.isArray(className)) {
    return (0, _classnames.default)(className.filter(function (name) {
      return !!name;
    }).map(function (name) {
      return pre + "-" + name;
    }));
  } // TODO Compatible with V4


  if (pre[pre.length - 1] === '-') {
    return "" + pre + className;
  }

  return pre + "-" + className;
}

var _default = (0, _curry.default)(prefix);

exports.default = _default;