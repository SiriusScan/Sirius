import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import useSortHelper from './helper/useSortHelper';
import { mergeRefs, useClassNames } from '../utils';
import ListContext from './ListContext';
import ListItem from './ListItem';
var List = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'list' : _props$classPrefix,
      className = props.className,
      bordered = props.bordered,
      hover = props.hover,
      _props$size = props.size,
      size = _props$size === void 0 ? 'md' : _props$size,
      sortable = props.sortable,
      _props$autoScroll = props.autoScroll,
      autoScroll = _props$autoScroll === void 0 ? true : _props$autoScroll,
      _props$pressDelay = props.pressDelay,
      pressDelay = _props$pressDelay === void 0 ? 0 : _props$pressDelay,
      _props$transitionDura = props.transitionDuration,
      transitionDuration = _props$transitionDura === void 0 ? 300 : _props$transitionDura,
      children = props.children,
      onSort = props.onSort,
      onSortEnd = props.onSortEnd,
      onSortMove = props.onSortMove,
      onSortStart = props.onSortStart,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "bordered", "hover", "size", "sortable", "autoScroll", "pressDelay", "transitionDuration", "children", "onSort", "onSortEnd", "onSortMove", "onSortStart"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var _useSortHelper = useSortHelper({
    autoScroll: autoScroll,
    onSort: onSort,
    onSortEnd: onSortEnd,
    onSortMove: onSortMove,
    onSortStart: onSortStart,
    pressDelay: pressDelay,
    transitionDuration: transitionDuration
  }),
      containerRef = _useSortHelper.containerRef,
      register = _useSortHelper.register,
      sorting = _useSortHelper.sorting,
      handleEnd = _useSortHelper.handleEnd,
      handleStart = _useSortHelper.handleStart;

  var classes = merge(className, withClassPrefix({
    bordered: bordered,
    sortable: sortable,
    sorting: sorting,
    hover: hover
  }));
  var contextValue = useMemo(function () {
    return {
      bordered: bordered,
      size: size,
      register: register
    };
  }, [bordered, register, size]);
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "list"
  }, rest, {
    ref: mergeRefs(containerRef, ref),
    className: classes,
    onMouseDown: sortable ? handleStart : undefined,
    onMouseUp: sortable ? handleEnd : undefined
  }), /*#__PURE__*/React.createElement(ListContext.Provider, {
    value: contextValue
  }, children));
});
List.Item = ListItem;
List.displayName = 'List';
List.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  bordered: PropTypes.bool,
  hover: PropTypes.bool,
  sortable: PropTypes.bool,
  size: PropTypes.oneOf(['lg', 'md', 'sm']),
  autoScroll: PropTypes.bool,
  pressDelay: PropTypes.number,
  transitionDuration: PropTypes.number,
  onSortStart: PropTypes.func,
  onSortMove: PropTypes.func,
  onSortEnd: PropTypes.func,
  onSort: PropTypes.func
};
export default List;