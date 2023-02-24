import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface DropdownMenuCheckItemProps extends WithAsProps {
    active?: boolean;
    checkboxAs?: React.ElementType | string;
    classPrefix?: string;
    disabled?: boolean;
    checkable?: boolean;
    indeterminate?: boolean;
    value?: string | number;
    focus?: boolean;
    title?: string;
    className?: string;
    children?: React.ReactNode;
    onSelect?: (value: any, event: React.SyntheticEvent, checked: boolean) => void;
    onCheck?: (value: any, event: React.SyntheticEvent, checked: boolean) => void;
    onSelectItem?: (value: any, event: React.SyntheticEvent, checked: boolean) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
}
declare const DropdownMenuCheckItem: RsRefForwardingComponent<'div', DropdownMenuCheckItemProps>;
export default DropdownMenuCheckItem;
