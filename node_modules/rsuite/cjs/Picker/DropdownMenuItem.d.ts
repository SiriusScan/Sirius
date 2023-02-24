import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface DropdownMenuItemProps extends WithAsProps {
    active?: boolean;
    disabled?: boolean;
    value?: any;
    focus?: boolean;
    title?: string;
    onSelect?: (value: any, event: React.MouseEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    renderItem?: (value: any) => React.ReactNode;
}
declare const DropdownMenuItem: RsRefForwardingComponent<'div', DropdownMenuItemProps>;
export default DropdownMenuItem;
