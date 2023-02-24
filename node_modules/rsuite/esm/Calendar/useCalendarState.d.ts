export declare enum CalendarState {
    'TIME' = "TIME",
    'MONTH' = "MONTH"
}
declare const useCalendarState: (defaultState?: CalendarState) => {
    calendarState: CalendarState | undefined;
    reset: () => void;
    openMonth: () => void;
    openTime: () => void;
};
export default useCalendarState;
