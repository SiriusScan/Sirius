"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ArrowDown = _interopRequireDefault(require("@rsuite/icons/legacy/ArrowDown"));

var _Spinner = _interopRequireDefault(require("@rsuite/icons/legacy/Spinner"));

var _DropdownMenuCheckItem = _interopRequireDefault(require("../Picker/DropdownMenuCheckItem"));

var _treeUtils = require("../utils/treeUtils");

var _utils = require("../utils");

var CheckTreeNode = /*#__PURE__*/(0, _react.forwardRef)(function (_ref, ref) {
  var _ref$as = _ref.as,
      Component = _ref$as === void 0 ? 'div' : _ref$as,
      style = _ref.style,
      className = _ref.className,
      _ref$classPrefix = _ref.classPrefix,
      classPrefix = _ref$classPrefix === void 0 ? 'check-tree-node' : _ref$classPrefix,
      _ref$visible = _ref.visible,
      visible = _ref$visible === void 0 ? true : _ref$visible,
      layer = _ref.layer,
      disabled = _ref.disabled,
      allUncheckable = _ref.allUncheckable,
      rtl = _ref.rtl,
      loading = _ref.loading,
      expand = _ref.expand,
      hasChildren = _ref.hasChildren,
      nodeData = _ref.nodeData,
      focus = _ref.focus,
      label = _ref.label,
      uncheckable = _ref.uncheckable,
      checkState = _ref.checkState,
      onExpand = _ref.onExpand,
      onSelect = _ref.onSelect,
      onRenderTreeIcon = _ref.onRenderTreeIcon,
      onRenderTreeNode = _ref.onRenderTreeNode,
      rest = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["as", "style", "className", "classPrefix", "visible", "layer", "disabled", "allUncheckable", "rtl", "loading", "expand", "hasChildren", "nodeData", "focus", "label", "uncheckable", "checkState", "onExpand", "onSelect", "onRenderTreeIcon", "onRenderTreeNode"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var getTitle = function getTitle() {
    if (typeof label === 'string') {
      return label;
    } else if ( /*#__PURE__*/_react.default.isValidElement(label)) {
      var nodes = (0, _utils.reactToString)(label);
      return nodes.join('');
    }
  };

  var handleExpand = (0, _react.useCallback)(function (event) {
    var _event$nativeEvent, _event$nativeEvent$st;

    // stop propagation when using custom loading icon
    event === null || event === void 0 ? void 0 : (_event$nativeEvent = event.nativeEvent) === null || _event$nativeEvent === void 0 ? void 0 : (_event$nativeEvent$st = _event$nativeEvent.stopImmediatePropagation) === null || _event$nativeEvent$st === void 0 ? void 0 : _event$nativeEvent$st.call(_event$nativeEvent);
    onExpand === null || onExpand === void 0 ? void 0 : onExpand(nodeData);
  }, [nodeData, onExpand]);
  var handleSelect = (0, _react.useCallback)(function (_value, event) {
    if (disabled || uncheckable) {
      return;
    }

    var isChecked = false;

    if (checkState === _utils.CHECK_STATE.UNCHECK || checkState === _utils.CHECK_STATE.INDETERMINATE) {
      isChecked = true;
    }

    if (checkState === _utils.CHECK_STATE.CHECK) {
      isChecked = false;
    }

    var nextNodeData = (0, _extends2.default)({}, nodeData, {
      check: isChecked
    });
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(nextNodeData, event);
  }, [disabled, checkState, uncheckable, nodeData, onSelect]);

  var renderIcon = function renderIcon() {
    var expandIconClasses = prefix('expand-icon', 'icon', {
      expanded: expand
    });

    var expandIcon = /*#__PURE__*/_react.default.createElement(_ArrowDown.default, {
      className: expandIconClasses
    });

    if (loading) {
      expandIcon = /*#__PURE__*/_react.default.createElement("div", {
        className: prefix('loading-icon')
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
        spin: true
      }));
    }

    if (typeof onRenderTreeIcon === 'function') {
      var customIcon = onRenderTreeIcon(nodeData);
      expandIcon = customIcon !== null ? /*#__PURE__*/_react.default.createElement("div", {
        className: prefix('custom-icon')
      }, customIcon) : expandIcon;
    }

    return hasChildren ? /*#__PURE__*/_react.default.createElement("div", {
      role: "button",
      tabIndex: -1,
      "data-ref": nodeData.refKey,
      className: prefix('expand-icon-wrapper'),
      onClick: handleExpand
    }, expandIcon) : null;
  };

  var renderLabel = function renderLabel() {
    return /*#__PURE__*/_react.default.createElement(_DropdownMenuCheckItem.default, {
      as: "div",
      active: checkState === _utils.CHECK_STATE.CHECK,
      indeterminate: checkState === _utils.CHECK_STATE.INDETERMINATE,
      focus: focus,
      checkable: !uncheckable,
      disabled: disabled,
      "data-layer": layer,
      value: nodeData.refKey,
      className: prefix('label'),
      title: getTitle(),
      onSelect: handleSelect
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: prefix('text-wrapper')
    }, typeof onRenderTreeNode === 'function' ? onRenderTreeNode(nodeData) : label));
  };

  var classes = merge(className, withClassPrefix({
    disabled: disabled,
    'all-uncheckable': !!allUncheckable,
    'text-muted': disabled,
    focus: focus
  }));
  var styles = (0, _extends2.default)({}, style, (0, _treeUtils.getTreeNodeIndent)(rtl, layer - 1));
  return visible ? /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "treeitem",
    "aria-label": label,
    "aria-expanded": expand,
    "aria-selected": checkState === _utils.CHECK_STATE.CHECK,
    "aria-disabled": disabled,
    "aria-level": layer
  }, rest, {
    style: styles,
    className: classes,
    ref: ref
  }), renderIcon(), renderLabel()) : null;
});
CheckTreeNode.displayName = 'CheckTreeNode';
CheckTreeNode.propTypes = {
  as: _propTypes.default.elementType,
  rtl: _propTypes.default.bool,
  classPrefix: _propTypes.default.string,
  visible: _propTypes.default.bool,
  style: _propTypes.default.object,
  label: _propTypes.default.any,
  layer: _propTypes.default.number,
  loading: _propTypes.default.bool,
  value: _propTypes.default.any,
  focus: _propTypes.default.bool,
  expand: _propTypes.default.bool,
  nodeData: _propTypes.default.object,
  disabled: _propTypes.default.bool,
  className: _propTypes.default.string,
  checkState: _propTypes.default.oneOf([_utils.CHECK_STATE.UNCHECK, _utils.CHECK_STATE.CHECK, _utils.CHECK_STATE.INDETERMINATE]),
  hasChildren: _propTypes.default.bool,
  uncheckable: _propTypes.default.bool,
  allUncheckable: _propTypes.default.bool,
  onExpand: _propTypes.default.func,
  onSelect: _propTypes.default.func,
  onRenderTreeIcon: _propTypes.default.func,
  onRenderTreeNode: _propTypes.default.func
};
var _default = CheckTreeNode;
exports.default = _default;