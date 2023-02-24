import React from 'react';
import { ItemDataType, WithAsProps, RsRefForwardingComponent } from '../@types/common';
import { ValueType } from './MultiCascader';
export interface DropdownMenuProps extends WithAsProps {
    disabledItemValues: ValueType;
    value: ValueType;
    childrenKey: string;
    valueKey: string;
    labelKey: string;
    menuWidth?: number;
    menuHeight?: number | string;
    cascade?: boolean;
    cascadeData: ItemDataType[][];
    cascadePaths?: ItemDataType[];
    uncheckableItemValues: ValueType;
    renderMenuItem?: (itemLabel: React.MouseEventHandler, item: ItemDataType) => React.ReactNode;
    renderMenu?: (children: ItemDataType[], menu: React.ReactNode, parentNode?: ItemDataType, layer?: number) => React.ReactNode;
    onCheck?: (node: ItemDataType, event: React.SyntheticEvent, checked: boolean) => void;
    onSelect?: (node: ItemDataType, cascadePaths: ItemDataType[], event: React.SyntheticEvent) => void;
}
/**
 * TODO: reuse Menu from Cascader for consistent behavior
 */
declare const DropdownMenu: RsRefForwardingComponent<'div', DropdownMenuProps>;
export default DropdownMenu;
