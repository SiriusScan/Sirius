"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _BreadcrumbItem = _interopRequireDefault(require("./BreadcrumbItem"));

var _templateObject;

var Breadcrumb = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "children", "maxItems", "separator", "locale", "onExpand"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var _useState = (0, _react.useState)(true),
      ellipsis = _useState[0],
      setEllipsis = _useState[1];

  var _useCustom = (0, _utils.useCustom)('Breadcrumb', overrideLocale),
      locale = _useCustom.locale;

  var renderSeparator = function renderSeparator(key) {
    return /*#__PURE__*/_react.default.createElement("span", {
      key: "breadcrumb-separator-" + key,
      "aria-hidden": true,
      className: prefix(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["separator"])))
    }, separator);
  };

  var handleClickEllipsis = (0, _react.useCallback)(function (event) {
    setEllipsis(false);
    onExpand === null || onExpand === void 0 ? void 0 : onExpand(event);
  }, [onExpand]);
  var items = [];

  var count = _react.default.Children.count(children);

  if (count) {
    _react.default.Children.forEach(children, function (item, index) {
      items.push(item);

      if (index < count - 1) {
        items.push(renderSeparator(index));
      }
    });
  }

  var renderCollapseItems = function renderCollapseItems() {
    if (count > maxItems && count > 2 && ellipsis) {
      return [].concat(items.slice(0, 2), [[/*#__PURE__*/_react.default.createElement(_BreadcrumbItem.default, {
        role: "button",
        key: "ellipsis",
        title: locale.expandText,
        "aria-label": locale.expandText,
        onClick: handleClickEllipsis
      }, /*#__PURE__*/_react.default.createElement("span", {
        "aria-hidden": true
      }, "..."))]], items.slice(items.length - 2, items.length));
    }

    return items;
  };

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), renderCollapseItems());
});

Breadcrumb.Item = _BreadcrumbItem.default;
Breadcrumb.displayName = 'Breadcrumb';
Breadcrumb.propTypes = {
  separator: _propTypes.default.node,
  as: _propTypes.default.elementType,
  children: _propTypes.default.node,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  maxItems: _propTypes.default.number,
  onExpand: _propTypes.default.func
};
var _default = Breadcrumb;
exports.default = _default;