"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.TREE_NODE_DROP_POSITION = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _TreePicker = _interopRequireDefault(require("../TreePicker"));

var _TreeContext = _interopRequireDefault(require("./TreeContext"));

/**
 * Tree Node Drag Type
 */
var TREE_NODE_DROP_POSITION;
exports.TREE_NODE_DROP_POSITION = TREE_NODE_DROP_POSITION;

(function (TREE_NODE_DROP_POSITION) {
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER"] = 0] = "DRAG_OVER";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_TOP"] = 1] = "DRAG_OVER_TOP";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_BOTTOM"] = 2] = "DRAG_OVER_BOTTOM";
})(TREE_NODE_DROP_POSITION || (exports.TREE_NODE_DROP_POSITION = TREE_NODE_DROP_POSITION = {}));

var Tree = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var contextValue = (0, _react.useMemo)(function () {
    return {
      inline: true
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement(_TreeContext.default.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_TreePicker.default, (0, _extends2.default)({
    ref: ref
  }, props)));
});

Tree.displayName = 'Tree';
var _default = Tree;
exports.default = _default;