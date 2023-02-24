"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = Menubar;

var _react = _interopRequireWildcard(require("react"));

var _isNil = _interopRequireDefault(require("lodash/isNil"));

var _MenuContext = _interopRequireWildcard(require("./MenuContext"));

var _utils = require("../utils");

var _events = require("../utils/events");

var _useMenu = _interopRequireDefault(require("./useMenu"));

var _dom = require("../utils/dom");

// Headless ARIA `menubar`

/**
 * @private
 */
function Menubar(_ref) {
  var _items$activeItemInde3;

  var _ref$vertical = _ref.vertical,
      vertical = _ref$vertical === void 0 ? false : _ref$vertical,
      children = _ref.children,
      onActivateItem = _ref.onActivateItem;
  var menubar = (0, _useMenu.default)({
    role: 'menubar'
  });
  var _menubar$ = menubar[0],
      items = _menubar$.items,
      activeItemIndex = _menubar$.activeItemIndex,
      dispatch = menubar[1];
  var menubarElementRef = (0, _react.useRef)(null);
  var onFocus = (0, _react.useCallback)(function (event) {
    // Focus moves inside Menubar
    if ((0, _events.isFocusEntering)(event) && // Skip if focus is moving to a focusable element within this menu
    !(event.target !== event.currentTarget && (0, _dom.isFocusableElement)(event.target))) {
      if (activeItemIndex === null) {
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.First
        });
      }
    }
  }, [activeItemIndex, dispatch]);
  var onBlur = (0, _react.useCallback)(function (event) {
    // Focus moves outside of Menubar
    if ((0, _events.isFocusLeaving)(event)) {
      dispatch({
        type: _MenuContext.MenuActionTypes.MoveFocus,
        to: _MenuContext.MoveFocusTo.None
      });
    }
  }, [dispatch]);

  var _useCustom = (0, _utils.useCustom)('Menubar'),
      rtl = _useCustom.rtl;

  var onKeyDown = (0, _react.useCallback)(function (event) {
    var _items$activeItemInde, _items$activeItemInde2;

    var activeItemElement = (0, _isNil.default)(activeItemIndex) ? null : (_items$activeItemInde = (_items$activeItemInde2 = items[activeItemIndex]) === null || _items$activeItemInde2 === void 0 ? void 0 : _items$activeItemInde2.element) !== null && _items$activeItemInde !== void 0 ? _items$activeItemInde : null;

    switch (true) {
      case !vertical && !rtl && event.key === _utils.KEY_VALUES.RIGHT:
      case !vertical && rtl && event.key === _utils.KEY_VALUES.LEFT:
      case vertical && event.key === _utils.KEY_VALUES.DOWN:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Next
        });
        break;

      case !vertical && !rtl && event.key === _utils.KEY_VALUES.LEFT:
      case !vertical && rtl && event.key === _utils.KEY_VALUES.RIGHT:
      case vertical && event.key === _utils.KEY_VALUES.UP:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Prev
        });
        break;

      case event.key === _utils.KEY_VALUES.HOME:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.First
        });
        break;

      case event.key === _utils.KEY_VALUES.END:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Last
        });
        break;

      case !vertical && event.key === _utils.KEY_VALUES.DOWN:
      case vertical && !rtl && event.key === _utils.KEY_VALUES.RIGHT:
      case vertical && rtl && event.key === _utils.KEY_VALUES.LEFT:
        if ((activeItemElement === null || activeItemElement === void 0 ? void 0 : activeItemElement.getAttribute('aria-haspopup')) === 'menu') {
          event.preventDefault();
          event.stopPropagation();
          activeItemElement.click();
        }

        break;

      case event.key === _utils.KEY_VALUES.ENTER:
      case event.key === _utils.KEY_VALUES.SPACE:
        event.preventDefault();
        event.stopPropagation();
        activeItemElement === null || activeItemElement === void 0 ? void 0 : activeItemElement.click();
        break;
    }
  }, [rtl, items, activeItemIndex, dispatch, vertical]); // Only used for handling click events bubbling from children
  // Which indicates that a child menuitem is being activated

  var onClick = (0, _react.useCallback)(function (event) {
    if (items.some(function (item) {
      return item.element === event.target;
    })) {
      onActivateItem === null || onActivateItem === void 0 ? void 0 : onActivateItem(event);
    }
  }, [items, onActivateItem]);
  return /*#__PURE__*/_react.default.createElement(_MenuContext.default.Provider, {
    value: menubar
  }, children({
    role: 'menubar',
    tabIndex: 0,
    onFocus: onFocus,
    onBlur: onBlur,
    onKeyDown: onKeyDown,
    onClick: onClick,
    'aria-activedescendant': (0, _isNil.default)(activeItemIndex) ? undefined : (_items$activeItemInde3 = items[activeItemIndex]) === null || _items$activeItemInde3 === void 0 ? void 0 : _items$activeItemInde3.element.id,
    'aria-orientation': vertical ? 'vertical' : undefined // implicitly set 'horizontal'

  }, menubarElementRef));
}