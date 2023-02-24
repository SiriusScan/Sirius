import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import Tooltip from '../Tooltip';
import Whisper from '../Whisper';
export default function appendTooltip(_ref) {
  var message = _ref.message,
      ref = _ref.ref,
      rest = _objectWithoutPropertiesLoose(_ref, ["message", "ref"]);

  return /*#__PURE__*/React.createElement(Whisper, _extends({
    ref: ref,
    speaker: /*#__PURE__*/React.createElement(Tooltip, null, message)
  }, rest));
}