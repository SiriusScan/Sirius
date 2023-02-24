"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var PlaceholderParagraph = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$rows = props.rows,
      rows = _props$rows === void 0 ? 2 : _props$rows,
      _props$rowHeight = props.rowHeight,
      rowHeight = _props$rowHeight === void 0 ? 10 : _props$rowHeight,
      _props$rowMargin = props.rowMargin,
      rowMargin = _props$rowMargin === void 0 ? 20 : _props$rowMargin,
      graph = props.graph,
      active = props.active,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'placeholder' : _props$classPrefix,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "rows", "rowHeight", "rowMargin", "graph", "active", "classPrefix"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var graphShape = graph === true ? 'square' : graph;
  var rowElements = (0, _react.useMemo)(function () {
    var rowArr = [];

    for (var i = 0; i < rows; i++) {
      var styles = {
        width: Math.random() * 75 + 25 + "%",
        height: rowHeight,
        marginTop: i > 0 ? rowMargin : Number(rowMargin) / 2
      };
      rowArr.push( /*#__PURE__*/_react.default.createElement("p", {
        key: i,
        style: styles
      }));
    }

    return rowArr;
  }, [rowHeight, rowMargin, rows]);
  var classes = merge(className, withClassPrefix('paragraph', {
    active: active
  }));
  var graphClasses = prefix('paragraph-graph', "paragraph-graph-" + graphShape);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), graphShape && /*#__PURE__*/_react.default.createElement("div", {
    className: graphClasses
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('paragraph-graph-inner')
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('paragraph-rows')
  }, rowElements));
});

PlaceholderParagraph.displayName = 'PlaceholderParagraph';
PlaceholderParagraph.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  rows: _propTypes.default.number,
  rowHeight: _propTypes.default.number,
  rowMargin: _propTypes.default.number,
  graph: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.oneOf(['circle', 'square', 'image'])]),
  active: _propTypes.default.bool
};
var _default = PlaceholderParagraph;
exports.default = _default;