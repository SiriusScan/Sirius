import React from 'react';
import translateDOMPositionXY from './utils/translateDOMPositionXY';
import isRTL from './utils/isRTL';
var TableContext = /*#__PURE__*/React.createContext({
  rtl: isRTL(),
  isTree: false,
  hasCustomTreeCol: false,
  translateDOMPositionXY: translateDOMPositionXY
});
export default TableContext;