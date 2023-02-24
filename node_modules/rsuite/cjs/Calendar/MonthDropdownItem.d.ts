import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
export interface MonthDropdownItemProps extends WithAsProps {
    month?: number;
    year?: number;
    active?: boolean;
    disabled?: boolean;
}
declare const MonthDropdownItem: RsRefForwardingComponent<'div', MonthDropdownItemProps>;
export default MonthDropdownItem;
