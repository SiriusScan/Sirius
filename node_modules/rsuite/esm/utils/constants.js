export var SIZE = ['lg', 'md', 'sm', 'xs'];
export var COLUMN_SIZE = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
export var STATUS = ['success', 'warning', 'error', 'info'];
export var COLOR = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'];
export var PLACEMENT_4 = ['top', 'bottom', 'right', 'left'];
export var PLACEMENT_8 = ['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'leftStart', 'rightStart', 'leftEnd', 'rightEnd'];
export var PLACEMENT_AUTO = ['auto', 'autoVertical', 'autoVerticalStart', 'autoVerticalEnd', 'autoHorizontal', 'autoHorizontalStart', 'autoHorizontalEnd'];
export var PLACEMENT = [].concat(PLACEMENT_4, PLACEMENT_8, PLACEMENT_AUTO);
/**
 *  Check Tree Node State
 */

export var CHECK_STATE;

(function (CHECK_STATE) {
  CHECK_STATE[CHECK_STATE["UNCHECK"] = 0] = "UNCHECK";
  CHECK_STATE[CHECK_STATE["CHECK"] = 1] = "CHECK";
  CHECK_STATE[CHECK_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(CHECK_STATE || (CHECK_STATE = {}));

export var TREE_NODE_PADDING = 16;
export var TREE_NODE_ROOT_PADDING = 12;
/**
 * Tree Node Drag Type
 */

export var TREE_NODE_DROP_POSITION;
/**
 * UI Events KeyboardEvent key Values
 * https://www.w3.org/TR/uievents-key
 */

(function (TREE_NODE_DROP_POSITION) {
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER"] = 0] = "DRAG_OVER";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_TOP"] = 1] = "DRAG_OVER_TOP";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_BOTTOM"] = 2] = "DRAG_OVER_BOTTOM";
})(TREE_NODE_DROP_POSITION || (TREE_NODE_DROP_POSITION = {}));

export var KEY_VALUES = {
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
export var DATERANGE_DISABLED_TARGET;

(function (DATERANGE_DISABLED_TARGET) {
  DATERANGE_DISABLED_TARGET["CALENDAR"] = "CALENDAR";
  DATERANGE_DISABLED_TARGET["TOOLBAR_BUTTON_OK"] = "TOOLBAR_BUTTON_OK";
  DATERANGE_DISABLED_TARGET["TOOLBAR_SHORTCUT"] = "TOOLBAR_SHORTCUT";
})(DATERANGE_DISABLED_TARGET || (DATERANGE_DISABLED_TARGET = {}));