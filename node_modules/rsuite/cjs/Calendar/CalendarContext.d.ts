import React from 'react';
import { CalendarContextValue } from './types';
declare const CalendarContext: React.Context<CalendarContextValue>;
export default CalendarContext;
export declare const CalendarProvider: React.Provider<CalendarContextValue>;
export declare const useCalendarContext: () => CalendarContextValue;
