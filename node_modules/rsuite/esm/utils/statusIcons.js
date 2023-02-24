import React from 'react';
import Info from '@rsuite/icons/legacy/Info';
import CheckCircle from '@rsuite/icons/legacy/CheckCircle';
import CloseCircle from '@rsuite/icons/legacy/CloseCircle';
import Remind from '@rsuite/icons/legacy/Remind';
import Check from '@rsuite/icons/Check';
import Close from '@rsuite/icons/Close';
export var MESSAGE_STATUS_ICONS = {
  info: /*#__PURE__*/React.createElement(Info, null),
  success: /*#__PURE__*/React.createElement(CheckCircle, null),
  error: /*#__PURE__*/React.createElement(CloseCircle, null),
  warning: /*#__PURE__*/React.createElement(Remind, null)
};
export var PROGRESS_STATUS_ICON = {
  success: /*#__PURE__*/React.createElement(Check, null),
  active: null,
  fail: /*#__PURE__*/React.createElement(Close, null)
};