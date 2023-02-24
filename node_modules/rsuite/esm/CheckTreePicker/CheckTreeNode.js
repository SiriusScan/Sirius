import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ArrowDown from '@rsuite/icons/legacy/ArrowDown';
import Spinner from '@rsuite/icons/legacy/Spinner';
import DropdownMenuCheckItem from '../Picker/DropdownMenuCheckItem';
import { getTreeNodeIndent } from '../utils/treeUtils';
import { useClassNames, CHECK_STATE, reactToString } from '../utils';
var CheckTreeNode = /*#__PURE__*/forwardRef(function (_ref, ref) {
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
      rest = _objectWithoutPropertiesLoose(_ref, ["as", "style", "className", "classPrefix", "visible", "layer", "disabled", "allUncheckable", "rtl", "loading", "expand", "hasChildren", "nodeData", "focus", "label", "uncheckable", "checkState", "onExpand", "onSelect", "onRenderTreeIcon", "onRenderTreeNode"]);

  var _useClassNames = useClassNames(classPrefix),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var getTitle = function getTitle() {
    if (typeof label === 'string') {
      return label;
    } else if ( /*#__PURE__*/React.isValidElement(label)) {
      var nodes = reactToString(label);
      return nodes.join('');
    }
  };

  var handleExpand = useCallback(function (event) {
    var _event$nativeEvent, _event$nativeEvent$st;

    // stop propagation when using custom loading icon
    event === null || event === void 0 ? void 0 : (_event$nativeEvent = event.nativeEvent) === null || _event$nativeEvent === void 0 ? void 0 : (_event$nativeEvent$st = _event$nativeEvent.stopImmediatePropagation) === null || _event$nativeEvent$st === void 0 ? void 0 : _event$nativeEvent$st.call(_event$nativeEvent);
    onExpand === null || onExpand === void 0 ? void 0 : onExpand(nodeData);
  }, [nodeData, onExpand]);
  var handleSelect = useCallback(function (_value, event) {
    if (disabled || uncheckable) {
      return;
    }

    var isChecked = false;

    if (checkState === CHECK_STATE.UNCHECK || checkState === CHECK_STATE.INDETERMINATE) {
      isChecked = true;
    }

    if (checkState === CHECK_STATE.CHECK) {
      isChecked = false;
    }

    var nextNodeData = _extends({}, nodeData, {
      check: isChecked
    });

    onSelect === null || onSelect === void 0 ? void 0 : onSelect(nextNodeData, event);
  }, [disabled, checkState, uncheckable, nodeData, onSelect]);

  var renderIcon = function renderIcon() {
    var expandIconClasses = prefix('expand-icon', 'icon', {
      expanded: expand
    });
    var expandIcon = /*#__PURE__*/React.createElement(ArrowDown, {
      className: expandIconClasses
    });

    if (loading) {
      expandIcon = /*#__PURE__*/React.createElement("div", {
        className: prefix('loading-icon')
      }, /*#__PURE__*/React.createElement(Spinner, {
        spin: true
      }));
    }

    if (typeof onRenderTreeIcon === 'function') {
      var customIcon = onRenderTreeIcon(nodeData);
      expandIcon = customIcon !== null ? /*#__PURE__*/React.createElement("div", {
        className: prefix('custom-icon')
      }, customIcon) : expandIcon;
    }

    return hasChildren ? /*#__PURE__*/React.createElement("div", {
      role: "button",
      tabIndex: -1,
      "data-ref": nodeData.refKey,
      className: prefix('expand-icon-wrapper'),
      onClick: handleExpand
    }, expandIcon) : null;
  };

  var renderLabel = function renderLabel() {
    return /*#__PURE__*/React.createElement(DropdownMenuCheckItem, {
      as: "div",
      active: checkState === CHECK_STATE.CHECK,
      indeterminate: checkState === CHECK_STATE.INDETERMINATE,
      focus: focus,
      checkable: !uncheckable,
      disabled: disabled,
      "data-layer": layer,
      value: nodeData.refKey,
      className: prefix('label'),
      title: getTitle(),
      onSelect: handleSelect
    }, /*#__PURE__*/React.createElement("span", {
      className: prefix('text-wrapper')
    }, typeof onRenderTreeNode === 'function' ? onRenderTreeNode(nodeData) : label));
  };

  var classes = merge(className, withClassPrefix({
    disabled: disabled,
    'all-uncheckable': !!allUncheckable,
    'text-muted': disabled,
    focus: focus
  }));

  var styles = _extends({}, style, getTreeNodeIndent(rtl, layer - 1));

  return visible ? /*#__PURE__*/React.createElement(Component, _extends({
    role: "treeitem",
    "aria-label": label,
    "aria-expanded": expand,
    "aria-selected": checkState === CHECK_STATE.CHECK,
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
  as: PropTypes.elementType,
  rtl: PropTypes.bool,
  classPrefix: PropTypes.string,
  visible: PropTypes.bool,
  style: PropTypes.object,
  label: PropTypes.any,
  layer: PropTypes.number,
  loading: PropTypes.bool,
  value: PropTypes.any,
  focus: PropTypes.bool,
  expand: PropTypes.bool,
  nodeData: PropTypes.object,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  checkState: PropTypes.oneOf([CHECK_STATE.UNCHECK, CHECK_STATE.CHECK, CHECK_STATE.INDETERMINATE]),
  hasChildren: PropTypes.bool,
  uncheckable: PropTypes.bool,
  allUncheckable: PropTypes.bool,
  onExpand: PropTypes.func,
  onSelect: PropTypes.func,
  onRenderTreeIcon: PropTypes.func,
  onRenderTreeNode: PropTypes.func
};
export default CheckTreeNode;