import _extends from "@babel/runtime/helpers/esm/extends";
import _taggedTemplateLiteralLoose from "@babel/runtime/helpers/esm/taggedTemplateLiteralLoose";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";

var _templateObject;

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useClassNames, useCustom } from '../utils';
import BreadcrumbItem from './BreadcrumbItem';
var Breadcrumb = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'nav' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'breadcrumb' : _props$classPrefix,
      children = props.children,
      _props$maxItems = props.maxItems,
      maxItems = _props$maxItems === void 0 ? 5 : _props$maxItems,
      _props$separator = props.separator,
      separator = _props$separator === void 0 ? '/' : _props$separator,
      overrideLocale = props.locale,
      onExpand = props.onExpand,
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "classPrefix", "children", "maxItems", "separator", "locale", "onExpand"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var _useState = useState(true),
      ellipsis = _useState[0],
      setEllipsis = _useState[1];

  var _useCustom = useCustom('Breadcrumb', overrideLocale),
      locale = _useCustom.locale;

  var renderSeparator = function renderSeparator(key) {
    return /*#__PURE__*/React.createElement("span", {
      key: "breadcrumb-separator-" + key,
      "aria-hidden": true,
      className: prefix(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["separator"])))
    }, separator);
  };

  var handleClickEllipsis = useCallback(function (event) {
    setEllipsis(false);
    onExpand === null || onExpand === void 0 ? void 0 : onExpand(event);
  }, [onExpand]);
  var items = [];
  var count = React.Children.count(children);

  if (count) {
    React.Children.forEach(children, function (item, index) {
      items.push(item);

      if (index < count - 1) {
        items.push(renderSeparator(index));
      }
    });
  }

  var renderCollapseItems = function renderCollapseItems() {
    if (count > maxItems && count > 2 && ellipsis) {
      return [].concat(items.slice(0, 2), [[/*#__PURE__*/React.createElement(BreadcrumbItem, {
        role: "button",
        key: "ellipsis",
        title: locale.expandText,
        "aria-label": locale.expandText,
        onClick: handleClickEllipsis
      }, /*#__PURE__*/React.createElement("span", {
        "aria-hidden": true
      }, "..."))]], items.slice(items.length - 2, items.length));
    }

    return items;
  };

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), renderCollapseItems());
});
Breadcrumb.Item = BreadcrumbItem;
Breadcrumb.displayName = 'Breadcrumb';
Breadcrumb.propTypes = {
  separator: PropTypes.node,
  as: PropTypes.elementType,
  children: PropTypes.node,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  maxItems: PropTypes.number,
  onExpand: PropTypes.func
};
export default Breadcrumb;