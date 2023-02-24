"use strict";

exports.__esModule = true;
exports.DATERANGE_DISABLED_TARGET = exports.KEY_VALUES = exports.TREE_NODE_DROP_POSITION = exports.TREE_NODE_ROOT_PADDING = exports.TREE_NODE_PADDING = exports.CHECK_STATE = exports.PLACEMENT = exports.PLACEMENT_AUTO = exports.PLACEMENT_8 = exports.PLACEMENT_4 = exports.COLOR = exports.STATUS = exports.COLUMN_SIZE = exports.SIZE = void 0;
var SIZE = ['lg', 'md', 'sm', 'xs'];
exports.SIZE = SIZE;
var COLUMN_SIZE = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
exports.COLUMN_SIZE = COLUMN_SIZE;
var STATUS = ['success', 'warning', 'error', 'info'];
exports.STATUS = STATUS;
var COLOR = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'];
exports.COLOR = COLOR;
var PLACEMENT_4 = ['top', 'bottom', 'right', 'left'];
exports.PLACEMENT_4 = PLACEMENT_4;
var PLACEMENT_8 = ['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'leftStart', 'rightStart', 'leftEnd', 'rightEnd'];
exports.PLACEMENT_8 = PLACEMENT_8;
var PLACEMENT_AUTO = ['auto', 'autoVertical', 'autoVerticalStart', 'autoVerticalEnd', 'autoHorizontal', 'autoHorizontalStart', 'autoHorizontalEnd'];
exports.PLACEMENT_AUTO = PLACEMENT_AUTO;
var PLACEMENT = [].concat(PLACEMENT_4, PLACEMENT_8, PLACEMENT_AUTO);
/**
 *  Check Tree Node State
 */

exports.PLACEMENT = PLACEMENT;
var CHECK_STATE;
exports.CHECK_STATE = CHECK_STATE;

(function (CHECK_STATE) {
  CHECK_STATE[CHECK_STATE["UNCHECK"] = 0] = "UNCHECK";
  CHECK_STATE[CHECK_STATE["CHECK"] = 1] = "CHECK";
  CHECK_STATE[CHECK_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(CHECK_STATE || (exports.CHECK_STATE = CHECK_STATE = {}));

var TREE_NODE_PADDING = 16;
exports.TREE_NODE_PADDING = TREE_NODE_PADDING;
var TREE_NODE_ROOT_PADDING = 12;
/**
 * Tree Node Drag Type
 */

exports.TREE_NODE_ROOT_PADDING = TREE_NODE_ROOT_PADDING;
var TREE_NODE_DROP_POSITION;
/**
 * UI Events KeyboardEvent key Values
 * https://www.w3.org/TR/uievents-key
 */

exports.TREE_NODE_DROP_POSITION = TREE_NODE_DROP_POSITION;

(function (TREE_NODE_DROP_POSITION) {
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER"] = 0] = "DRAG_OVER";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_TOP"] = 1] = "DRAG_OVER_TOP";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_BOTTOM"] = 2] = "DRAG_OVER_BOTTOM";
})(TREE_NODE_DROP_POSITION || (exports.TREE_NODE_DROP_POSITION = TREE_NODE_DROP_POSITION = {}));

var KEY_VALUES = {
  // Navigation Keys
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  END: 'End',
  HOME: 'Home',
  PAGE_DOWN: 'PageDown',
  PAGE_UP: 'PageUp',
  // Whitespace Keys
  ENTER: 'Enter',
  TAB: 'Tab',
  SPACE: ' ',
  // Editing Keys
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  COMMA: ',',
  // UI Keys
  ESC: 'Escape'
};
exports.KEY_VALUES = KEY_VALUES;
var DATERANGE_DISABLED_TARGET;
exports.DATERANGE_DISABLED_TARGET = DATERANGE_DISABLED_TARGET;

(function (DATERANGE_DISABLED_TARGET) {
  DATERANGE_DISABLED_TARGET["CALENDAR"] = "CALENDAR";
  DATERANGE_DISABLED_TARGET["TOOLBAR_BUTTON_OK"] = "TOOLBAR_BUTTON_OK";
  DATERANGE_DISABLED_TARGET["TOOLBAR_SHORTCUT"] = "TOOLBAR_SHORTCUT";
})(DATERANGE_DISABLED_TARGET || (exports.DATERANGE_DISABLED_TARGET = DATERANGE_DISABLED_TARGET = {}));