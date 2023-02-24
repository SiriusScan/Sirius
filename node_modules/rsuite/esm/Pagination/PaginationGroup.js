import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Pagination from './Pagination';
import SelectPicker from '../SelectPicker';
import Divider from '../Divider';
import Input from '../Input';
import { tplTransform, useClassNames, useCustom, useControlled } from '../utils';

var LimitPicker = function LimitPicker(props) {
  var disabled = props.disabled,
      limitOptions = props.limitOptions,
      locale = props.locale,
      limit = props.limit,
      onChangeLimit = props.onChangeLimit,
      size = props.size,
      prefix = props.prefix;
  var disabledPicker = typeof disabled === 'function' ? disabled('picker') : Boolean(disabled);
  var formatlimitOptions = limitOptions.map(function (item) {
    return {
      value: item,
      label: locale.limit && tplTransform(locale.limit, item)
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    className: prefix('limit')
  }, /*#__PURE__*/React.createElement(SelectPicker, {
    size: size,
    cleanable: false,
    searchable: false,
    placement: "topStart",
    data: formatlimitOptions,
    value: limit,
    onChange: onChangeLimit // fixme don't use any
    ,
    menuStyle: {
      minWidth: 'auto'
    },
    disabled: disabledPicker
  }));
};

var defaultLayout = ['pager'];
var defaultLimitOptions = [30, 50, 100];
var PaginationGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'pagination-group' : _props$classPrefix,
      size = props.size,
      total = props.total,
      prev = props.prev,
      next = props.next,
      first = props.first,
      last = props.last,
      maxButtons = props.maxButtons,
      className = props.className,
      _props$limitOptions = props.limitOptions,
      limitOptions = _props$limitOptions === void 0 ? defaultLimitOptions : _props$limitOptions,
      limitProp = props.limit,
      activePageProp = props.activePage,
      disabled = props.disabled,
      style = props.style,
      localeProp = props.locale,
      _props$layout = props.layout,
      layout = _props$layout === void 0 ? defaultLayout : _props$layout,
      onChangePage = props.onChangePage,
      onChangeLimit = props.onChangeLimit,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "size", "total", "prev", "next", "first", "last", "maxButtons", "className", "limitOptions", "limit", "activePage", "disabled", "style", "locale", "layout", "onChangePage", "onChangeLimit"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var _useControlled = useControlled(limitProp, 30),
      limit = _useControlled[0],
      setLimit = _useControlled[1];

  var _useControlled2 = useControlled(activePageProp, 1),
      activePage = _useControlled2[0],
      setActivePage = _useControlled2[1];

  var _useCustom = useCustom('Pagination', localeProp),
      locale = _useCustom.locale;

  var pages = Math.floor(total / limit) + (total % limit ? 1 : 0);
  var classes = merge(className, withClassPrefix(size));
  var handleInputBlur = useCallback(function (event) {
    var value = parseInt(event.target.value);

    if (value > 0 && value <= pages) {
      onChangePage === null || onChangePage === void 0 ? void 0 : onChangePage(value);
      setActivePage(value);
    }

    event.target.value = '';
  }, [onChangePage, pages, setActivePage]);
  var handleInputPressEnter = useCallback(function (event) {
    var _event$target;

    (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.blur();
  }, []);
  var handleChangeLimit = useCallback(function (value) {
    setLimit(value);
    onChangeLimit === null || onChangeLimit === void 0 ? void 0 : onChangeLimit(value);
  }, [onChangeLimit, setLimit]);
  return /*#__PURE__*/React.createElement(Component, {
    ref: ref,
    className: classes,
    style: style
  }, layout.map(function (key, index) {
    var onlyKey = "" + key + index;

    if (key === '-') {
      return /*#__PURE__*/React.createElement("div", {
        className: prefix('grow'),
        key: onlyKey
      });
    } else if (key === '|') {
      return /*#__PURE__*/React.createElement(Divider, {
        vertical: true,
        key: onlyKey
      });
    } else if (key === 'pager') {
      return /*#__PURE__*/React.createElement(Pagination, _extends({
        key: onlyKey,
        size: size,
        prev: prev,
        next: next,
        first: first,
        last: last,
        maxButtons: maxButtons,
        pages: pages,
        disabled: disabled,
        onSelect: onChangePage // fixme don't use any
        ,
        activePage: activePage
      }, rest));
    } else if (key === 'total') {
      return /*#__PURE__*/React.createElement("div", {
        key: onlyKey,
        className: prefix('total')
      }, locale.total && tplTransform(locale.total, total));
    } else if (key === 'skip') {
      return /*#__PURE__*/React.createElement("div", {
        key: onlyKey,
        className: classNames(prefix('skip'))
      }, locale.skip && tplTransform(locale.skip, /*#__PURE__*/React.createElement(Input, {
        size: size,
        onBlur: handleInputBlur,
        onPressEnter: handleInputPressEnter
      })));
    } else if (key === 'limit') {
      return /*#__PURE__*/React.createElement(LimitPicker, {
        key: onlyKey,
        size: size,
        locale: locale,
        limit: limit,
        onChangeLimit: handleChangeLimit,
        limitOptions: limitOptions,
        disabled: disabled,
        prefix: prefix
      });
    }

    return key;
  }));
});
PaginationGroup.displayName = 'PaginationGroup';
PaginationGroup.propTypes = _extends({}, Pagination.propTypes, {
  locale: PropTypes.any,
  layout: PropTypes.array,
  limitOptions: PropTypes.array,
  limit: PropTypes.number,
  total: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangeLimit: PropTypes.func
});
export default PaginationGroup;