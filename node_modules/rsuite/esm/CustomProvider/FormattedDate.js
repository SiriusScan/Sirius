import React from 'react';
import { useCustom } from '../utils';

function FormattedDate(_ref) {
  var date = _ref.date,
      formatStr = _ref.formatStr;

  var _useCustom = useCustom('Calendar'),
      formatDate = _useCustom.formatDate;

  return /*#__PURE__*/React.createElement(React.Fragment, null, formatDate(date, formatStr));
}

export default FormattedDate;