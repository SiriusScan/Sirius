import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
export interface TimeDropdownProps extends WithAsProps {
    show?: boolean;
    showMeridian?: boolean;
    disabledDate?: (date: Date) => boolean;
    disabledHours?: (hour: number, date: Date) => boolean;
    disabledMinutes?: (minute: number, date: Date) => boolean;
    disabledSeconds?: (second: number, date: Date) => boolean;
    hideHours?: (hour: number, date: Date) => boolean;
    hideMinutes?: (minute: number, date: Date) => boolean;
    hideSeconds?: (second: number, date: Date) => boolean;
}
/**
 * Get the effective range of hours, minutes and seconds
 * @param meridian
 */
export declare function getRanges(meridian: boolean): {
    hours: {
        start: number;
        end: number;
    };
    minutes: {
        start: number;
        end: number;
    };
    seconds: {
        start: number;
        end: number;
    };
};
/**
 * Convert the 24-hour clock to the 12-hour clock
 * @param hours
 */
export declare function getMeridianHours(hours: number): number;
declare const TimeDropdown: RsRefForwardingComponent<'div', TimeDropdownProps>;
export default TimeDropdown;
