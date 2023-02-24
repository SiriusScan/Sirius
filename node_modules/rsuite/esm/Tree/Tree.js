import _extends from "@babel/runtime/helpers/esm/extends";
import React, { useMemo } from 'react';
import TreePicker from '../TreePicker';
import TreeContext from './TreeContext';

/**
 * Tree Node Drag Type
 */
export var TREE_NODE_DROP_POSITION;

(function (TREE_NODE_DROP_POSITION) {
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER"] = 0] = "DRAG_OVER";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_TOP"] = 1] = "DRAG_OVER_TOP";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_BOTTOM"] = 2] = "DRAG_OVER_BOTTOM";
})(TREE_NODE_DROP_POSITION || (TREE_NODE_DROP_POSITION = {}));

var Tree = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var contextValue = useMemo(function () {
    return {
      inline: true
    };
  }, []);
  return /*#__PURE__*/React.createElement(TreeContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(TreePicker, _extends({
    ref: ref
  }, props)));
});
Tree.displayName = 'Tree';
export default Tree;