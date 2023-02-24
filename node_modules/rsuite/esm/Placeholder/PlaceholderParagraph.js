import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var PlaceholderParagraph = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "rows", "rowHeight", "rowMargin", "graph", "active", "classPrefix"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var graphShape = graph === true ? 'square' : graph;
  var rowElements = useMemo(function () {
    var rowArr = [];

    for (var i = 0; i < rows; i++) {
      var styles = {
        width: Math.random() * 75 + 25 + "%",
        height: rowHeight,
        marginTop: i > 0 ? rowMargin : Number(rowMargin) / 2
      };
      rowArr.push( /*#__PURE__*/React.createElement("p", {
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
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), graphShape && /*#__PURE__*/React.createElement("div", {
    className: graphClasses
  }, /*#__PURE__*/React.createElement("span", {
    className: prefix('paragraph-graph-inner')
  })), /*#__PURE__*/React.createElement("div", {
    className: prefix('paragraph-rows')
  }, rowElements));
});
PlaceholderParagraph.displayName = 'PlaceholderParagraph';
PlaceholderParagraph.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  rows: PropTypes.number,
  rowHeight: PropTypes.number,
  rowMargin: PropTypes.number,
  graph: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['circle', 'square', 'image'])]),
  active: PropTypes.bool
};
export default PlaceholderParagraph;