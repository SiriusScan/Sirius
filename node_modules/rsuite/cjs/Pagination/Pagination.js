"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = void 0;

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteralLoose"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _More = _interopRequireDefault(require("@rsuite/icons/legacy/More"));

var _PagePrevious = _interopRequireDefault(require("@rsuite/icons/legacy/PagePrevious"));

var _PageNext = _interopRequireDefault(require("@rsuite/icons/legacy/PageNext"));

var _PageTop = _interopRequireDefault(require("@rsuite/icons/legacy/PageTop"));

var _PageEnd = _interopRequireDefault(require("@rsuite/icons/legacy/PageEnd"));

var _PaginationButton = _interopRequireDefault(require("./PaginationButton"));

var _utils = require("../utils");

var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;

var PAGINATION_ICONS = {
  more: /*#__PURE__*/_react.default.createElement(_More.default, null),
  prev: /*#__PURE__*/_react.default.createElement(_PagePrevious.default, null),
  next: /*#__PURE__*/_react.default.createElement(_PageNext.default, null),
  first: /*#__PURE__*/_react.default.createElement(_PageTop.default, null),
  last: /*#__PURE__*/_react.default.createElement(_PageEnd.default, null)
};

var Pagination = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'pagination' : _props$classPrefix,
      disabledProp = props.disabled,
      overrideLocale = props.locale,
      _props$activePage = props.activePage,
      activePage = _props$activePage === void 0 ? 1 : _props$activePage,
      maxButtons = props.maxButtons,
      _props$pages = props.pages,
      pages = _props$pages === void 0 ? 1 : _props$pages,
      ellipsis = props.ellipsis,
      boundaryLinks = props.boundaryLinks,
      first = props.first,
      prev = props.prev,
      next = props.next,
      last = props.last,
      _props$size = props.size,
      size = _props$size === void 0 ? 'xs' : _props$size,
      linkAs = props.linkAs,
      linkProps = props.linkProps,
      onSelect = props.onSelect,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "disabled", "locale", "activePage", "maxButtons", "pages", "ellipsis", "boundaryLinks", "first", "prev", "next", "last", "size", "linkAs", "linkProps", "onSelect"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var _useCustom = (0, _utils.useCustom)('Pagination', overrideLocale),
      locale = _useCustom.locale;

  var renderItem = (0, _react.useCallback)(function (key, itemProps) {
    var eventKey = itemProps.eventKey,
        disabled = itemProps.disabled,
        itemRest = (0, _objectWithoutPropertiesLoose2.default)(itemProps, ["eventKey", "disabled"]);
    var disabledItem = disabled;

    if (typeof disabledProp !== 'undefined') {
      disabledItem = typeof disabledProp === 'function' ? disabledProp(eventKey) : disabledProp;
    }

    var title = (locale === null || locale === void 0 ? void 0 : locale[key]) || eventKey;
    return /*#__PURE__*/_react.default.createElement(_PaginationButton.default, (0, _extends2.default)({
      "aria-label": title,
      title: title
    }, itemRest, linkProps, {
      key: key + "-" + eventKey,
      eventKey: eventKey,
      as: linkAs,
      disabled: disabledItem,
      onSelect: disabledItem ? undefined : onSelect
    }));
  }, [disabledProp, linkAs, linkProps, locale, onSelect]);

  var renderFirst = function renderFirst() {
    if (!first) {
      return null;
    }

    return renderItem('first', {
      eventKey: 1,
      disabled: activePage === 1,
      children: /*#__PURE__*/_react.default.createElement("span", {
        className: prefix(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["symbol"])))
      }, first === true ? PAGINATION_ICONS.first : first)
    });
  };

  var renderPrev = function renderPrev() {
    if (!prev) {
      return null;
    }

    return renderItem('prev', {
      eventKey: activePage - 1,
      disabled: activePage === 1,
      children: /*#__PURE__*/_react.default.createElement("span", {
        className: prefix(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteralLoose2.default)(["symbol"])))
      }, prev === true ? PAGINATION_ICONS.prev : prev)
    });
  };

  var renderPageButtons = function renderPageButtons() {
    var pageButtons = [];
    var startPage;
    var endPage;
    var hasHiddenPagesAfter;

    if (maxButtons) {
      var hiddenPagesBefore = activePage - Math.floor(maxButtons / 2);
      startPage = hiddenPagesBefore > 1 ? hiddenPagesBefore : 1;
      hasHiddenPagesAfter = startPage + maxButtons <= pages;

      if (!hasHiddenPagesAfter) {
        endPage = pages;
        startPage = pages - maxButtons + 1;

        if (startPage < 1) {
          startPage = 1;
        }
      } else {
        endPage = startPage + maxButtons - 1;
      }
    } else {
      startPage = 1;
      endPage = pages;
    }

    for (var pagenumber = startPage; pagenumber <= endPage; pagenumber += 1) {
      pageButtons.push(renderItem(pagenumber, {
        eventKey: pagenumber,
        active: pagenumber === activePage,
        children: pagenumber
      }));
    }

    if (boundaryLinks && ellipsis && startPage !== 1) {
      pageButtons.unshift(renderItem('more', {
        eventKey: 'ellipsisFirst',
        disabled: true,
        children: /*#__PURE__*/_react.default.createElement("span", {
          className: prefix(_templateObject3 || (_templateObject3 = (0, _taggedTemplateLiteralLoose2.default)(["symbol"])))
        }, ellipsis === true ? PAGINATION_ICONS.more : ellipsis)
      }));
      pageButtons.unshift(renderItem(1, {
        eventKey: 1,
        children: 1
      }));
    }

    if (maxButtons && hasHiddenPagesAfter && ellipsis) {
      pageButtons.push(renderItem('more', {
        eventKey: 'ellipsis',
        disabled: true,
        children: /*#__PURE__*/_react.default.createElement("span", {
          className: prefix(_templateObject4 || (_templateObject4 = (0, _taggedTemplateLiteralLoose2.default)(["symbol"])))
        }, ellipsis === true ? PAGINATION_ICONS.more : ellipsis)
      }));

      if (boundaryLinks && endPage !== pages) {
        pageButtons.push(renderItem(pages, {
          eventKey: pages,
          disabled: false,
          children: pages
        }));
      }
    }

    return pageButtons;
  };

  var renderNext = function renderNext() {
    if (!next) {
      return null;
    }

    return renderItem('next', {
      eventKey: activePage + 1,
      disabled: activePage >= pages,
      children: /*#__PURE__*/_react.default.createElement("span", {
        className: prefix(_templateObject5 || (_templateObject5 = (0, _taggedTemplateLiteralLoose2.default)(["symbol"])))
      }, next === true ? PAGINATION_ICONS.next : next)
    });
  };

  var renderLast = function renderLast() {
    if (!last) {
      return null;
    }

    return renderItem('last', {
      eventKey: pages,
      disabled: activePage >= pages,
      children: /*#__PURE__*/_react.default.createElement("span", {
        className: prefix(_templateObject6 || (_templateObject6 = (0, _taggedTemplateLiteralLoose2.default)(["symbol"])))
      }, last === true ? PAGINATION_ICONS.last : last)
    });
  };

  var classes = merge(className, withClassPrefix(size));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), renderFirst(), renderPrev(), renderPageButtons(), renderNext(), renderLast());
});

Pagination.displayName = 'Pagination';
Pagination.propTypes = {
  onSelect: _propTypes.default.func,
  activePage: _propTypes.default.number,
  pages: _propTypes.default.number,
  maxButtons: _propTypes.default.number,
  boundaryLinks: _propTypes.default.bool,
  ellipsis: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.node]),
  first: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.node]),
  last: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.node]),
  prev: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.node]),
  next: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.node]),
  linkAs: _propTypes.default.elementType,
  linkProps: _propTypes.default.object,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  locale: _propTypes.default.any,
  disabled: _propTypes.default.oneOfType([_propTypes.default.bool, _propTypes.default.func])
};
var _default = Pagination;
exports.default = _default;