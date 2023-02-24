import React, { useContext } from 'react';
var CalendarContext = /*#__PURE__*/React.createContext({});
export default CalendarContext;
export var CalendarProvider = CalendarContext.Provider;
export var useCalendarContext = function useCalendarContext() {
  return useContext(CalendarContext) || {};
};